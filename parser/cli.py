from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from supabase import create_client

from parser import parser as parser_module


def load_clean_json(path: Path) -> list[dict[str, Any]]:
    with path.open('r', encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError('tools_clean.json must contain an array')
    return [item for item in data if isinstance(item, dict)]


def write_seed_sql(rows: list[dict[str, Any]], output_path: Path) -> None:
    columns = ['name', 'slug', 'url', 'affiliate_url', 'description', 'category', 'pricing', 'domain', 'tags', 'commission_rate', 'click_count', 'featured', 'verified']
    lines = ['insert into public.tools (' + ', '.join(columns) + ') values']
    value_lines: list[str] = []
    for row in rows:
        tags = row.get('tags') or []
        formatted_tags = 'array[' + ','.join(f"'{str(tag).replace("'", "''")}" for tag in tags) + ']'
        values = [
            f"'{str(row.get('name', '')).replace("'", "''")}'",
            f"'{str(row.get('slug', '')).replace("'", "''")}'",
            f"'{str(row.get('url', '')).replace("'", "''")}'",
            'null' if not row.get('affiliate_url') else f"'{str(row.get('affiliate_url')).replace("'", "''")}'",
            f"'{str(row.get('description', '')).replace("'", "''")}'",
            f"'{str(row.get('category', '')).replace("'", "''")}'",
            f"'{str(row.get('pricing', '')).replace("'", "''")}'",
            f"'{str(row.get('domain', '')).replace("'", "''")}'",
            formatted_tags,
            str(row.get('commission_rate', 0)),
            str(row.get('click_count', 0)),
            'true' if row.get('featured') else 'false',
            'true' if row.get('verified') else 'false',
        ]
        value_lines.append('(' + ', '.join(values) + ')')
    lines.append(',\n'.join(value_lines))
    lines.append('on conflict (domain) do update set')
    lines.append('  name = excluded.name,')
    lines.append('  slug = excluded.slug,')
    lines.append('  url = excluded.url,')
    lines.append('  affiliate_url = excluded.affiliate_url,')
    lines.append('  description = excluded.description,')
    lines.append('  category = excluded.category,')
    lines.append('  pricing = excluded.pricing,')
    lines.append('  tags = excluded.tags,')
    lines.append('  commission_rate = excluded.commission_rate,')
    lines.append('  click_count = excluded.click_count,')
    lines.append('  featured = excluded.featured,')
    lines.append('  verified = excluded.verified;')
    output_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def apply_seed_sql(sql_path: Path) -> int:
    database_url = __import__('os').environ.get('SUPABASE_DB_URL', '').strip()
    if not database_url:
        print('Missing SUPABASE_DB_URL for direct SQL seed execution', file=sys.stderr)
        return 1

    result = subprocess.run(['psql', database_url, '-f', str(sql_path)], check=False)
    return result.returncode


def import_rows(rows: list[dict[str, Any]]) -> int:
    supabase_url = __import__('os').environ.get('NEXT_PUBLIC_SUPABASE_URL', '').strip()
    service_key = __import__('os').environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
    if not supabase_url or not service_key:
        print('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', file=sys.stderr)
        return 1

    client = create_client(supabase_url, service_key)
    response = client.table('tools').upsert(rows, on_conflict='domain').execute()
    affected = len(response.data or [])
    print(f'Imported {affected} tools into Supabase')
    return 0


def main() -> int:
    cli = argparse.ArgumentParser(description='TAAFT → Supabase import workflow')
    cli.add_argument('--input', default='taaft.json', help='Source TAAFT JSON file')
    cli.add_argument('--output', default='tools_clean.json', help='Output cleaned JSON file')
    cli.add_argument('--errors', default='parsing_errors.json', help='Parsing errors file')
    cli.add_argument('--import', dest='do_import', action='store_true', help='Import cleaned rows into Supabase')
    cli.add_argument('--auto', action='store_true', help='Run parse + export + import in one command')
    cli.add_argument('--seed', action='store_true', help='Parse and generate the SQL seed file automatically')
    cli.add_argument('--sql-seed', action='store_true', help='Write a ready-to-run SQL seed file for Supabase')
    cli.add_argument('--apply-sql', action='store_true', help='Apply the generated SQL seed through psql')
    cli.add_argument('--dry-run', action='store_true', help='Parse and print summary only')
    args = cli.parse_args()

    parser_module.INPUT_FILE = Path(args.input)
    parser_module.OUTPUT_FILE = Path(args.output)
    parser_module.ERROR_FILE = Path(args.errors)

    parser_module.main()

    clean_rows = load_clean_json(Path(args.output))
    print(f'Clean tools: {len(clean_rows)}')
    if args.dry_run:
        return 0
    if args.seed or args.sql_seed:
        seed_path = Path(args.output).with_suffix('.sql')
        write_seed_sql(clean_rows, seed_path)
        print(f'Seed file ready: {seed_path}')
        if args.apply_sql:
            return apply_seed_sql(seed_path)
    if args.do_import or args.auto:
        return import_rows(clean_rows)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
