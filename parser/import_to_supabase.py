#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

from supabase import create_client


def load_json(path: Path) -> list[dict[str, Any]]:
    with path.open('r', encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError('Expected a JSON array in the input file')
    return [item for item in data if isinstance(item, dict)]


def main() -> int:
    parser = argparse.ArgumentParser(description='Import cleaned tools JSON into Supabase')
    parser.add_argument('--input', default='tools_clean.json', help='Path to tools_clean.json')
    parser.add_argument('--dry-run', action='store_true', help='Print rows instead of inserting')
    args = parser.parse_args()

    supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '').strip()
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
    if not supabase_url or not service_key:
        print('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', file=sys.stderr)
        return 1

    input_path = Path(args.input)
    rows = load_json(input_path)
    if args.dry_run:
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return 0

    client = create_client(supabase_url, service_key)
    response = client.table('tools').upsert(rows, on_conflict='domain').execute()
    if getattr(response, 'data', None) is None:
        print('Import completed with no returned data')
    else:
        print(f'Imported {len(response.data)} tools')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
