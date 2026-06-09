from __future__ import annotations

import argparse
import json
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


def import_rows(rows: list[dict[str, Any]]) -> int:
    supabase_url = (parser_module.__dict__.get('os') or __import__('os')).environ.get('NEXT_PUBLIC_SUPABASE_URL', '').strip()
    service_key = (parser_module.__dict__.get('os') or __import__('os')).environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
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
    if args.seed:
        print(f'Seed file ready: {args.output}')
    if args.do_import or args.auto:
        return import_rows(clean_rows)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
