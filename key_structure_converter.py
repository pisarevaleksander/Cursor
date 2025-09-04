#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Key Structure Converter
- Parses flat lines like "key.N=Name" and "N.attr=value"
- Keeps only rows where location contains VIDEO (if location absent - exclude row)
- Builds hierarchy using parentId to fill columns: Уровень 1..Уровень 4
- Outputs CSV and Markdown

Usage:
  python key_structure_converter.py input.txt --csv out.csv --md out.md

If no output paths are given, prints Markdown to stdout.
"""

import argparse
import re
import sys
from typing import Dict, Any, List, Optional, Tuple
import csv

def parse_flat_spec(text: str) -> Dict[str, Dict[str, Any]]:
    nodes: Dict[str, Dict[str, Any]] = {}
    key_pat = re.compile(r'^\s*key\.(\d+)\s*=\s*(.+?)\s*$', re.I)
    attr_pat = re.compile(r'^\s*(\d+)\.(\w+)\s*=\s*(.+?)\s*$')
    for line in text.splitlines():
        if not line.strip():
            continue
        m_key = key_pat.match(line)
        if m_key:
            kid, name = m_key.group(1), m_key.group(2)
            nodes.setdefault(kid, {})
            nodes[kid]['name'] = name
            nodes[kid]['Key'] = int(kid)
            continue
        m_attr = attr_pat.match(line)
        if m_attr:
            kid, attr, value = m_attr.group(1), m_attr.group(2), m_attr.group(3)
            nodes.setdefault(kid, {})
            # Normalize known integer fields
            if attr.lower() == 'parentid':
                try:
                    nodes[kid]['parentId'] = int(value)
                except ValueError:
                    nodes[kid]['parentId'] = None
            elif attr.lower() == 'interestid':
                try:
                    nodes[kid]['interestId'] = int(value)
                except ValueError:
                    nodes[kid]['interestId'] = None
            else:
                nodes[kid][attr] = value
    # Ensure Key as int
    for kid, data in nodes.items():
        if 'Key' not in data:
            data['Key'] = int(kid)
    return nodes

def has_video_location(node: Dict[str, Any]) -> bool:
    loc = node.get('location')
    if not loc:
        return False
    # Accept if exact token VIDEO present among comma-separated tokens
    tokens = [t.strip().upper() for t in str(loc).split(',') if t.strip()]
    return 'VIDEO' in tokens

def build_name_chain(nodes: Dict[str, Dict[str, Any]], start_id: int, max_depth: int = 10) -> List[Tuple[int, str]]:
    """
    Returns a list of (Key, name) from the root to the current node.
    max_depth avoids infinite loops on malformed data.
    """
    chain: List[Tuple[int, str]] = []
    seen = set()
    current = start_id
    depth = 0
    while current is not None and depth < max_depth:
        if current in seen:
            # break cycles
            break
        seen.add(current)
        node = nodes.get(str(current), {})
        name = node.get('name', f'#{current}')
        chain.append((current, name))
        current = node.get('parentId')
        depth += 1
    chain.reverse()
    return chain

def to_rows(nodes: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    # For output, include only nodes where location contains VIDEO.
    out: List[Dict[str, Any]] = []
    # Precompute int parentId for all
    for k, data in nodes.items():
        if 'parentId' in data and isinstance(data['parentId'], str):
            try:
                data['parentId'] = int(data['parentId'])
            except Exception:
                data['parentId'] = None

    for k, data in nodes.items():
        if not has_video_location(data):
            continue
        key_int = int(data['Key'])
        chain = build_name_chain(nodes, key_int)
        # Fill levels up to 4, padding with None
        level_names = [name for _, name in chain]
        # Determine the position of current node in chain
        # Current node is the last element of chain
        # Map to Уровень 1..4 left-aligned
        levels = [None, None, None, None]
        for i in range(min(4, len(level_names))):
            levels[i] = level_names[i]
        row = {
            'Key': key_int,
            'Уровень 1': levels[0],
            'Уровень 2': levels[1],
            'Уровень 3': levels[2],
            'Уровень 4': levels[3],
            'parentId': data.get('parentId'),
            'category': data.get('category'),
            'logName': data.get('logName'),
            'location': data.get('location'),
            'interestId': data.get('interestId'),
        }
        out.append(row)

    # Sort by Key ascending for stable output
    out.sort(key=lambda r: r['Key'])
    return out

def rows_to_markdown(rows: List[Dict[str, Any]]) -> str:
    headers = ['Key','Уровень 1','Уровень 2','Уровень 3','Уровень 4','parentId','category','logName','location','interestId']
    md = []
    md.append('| ' + ' | '.join(headers) + ' |')
    md.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')
    for r in rows:
        md.append('| ' + ' | '.join('NULL' if r.get(h) is None else str(r.get(h)) for h in headers) + ' |')
    return '\n'.join(md)

def main():
    ap = argparse.ArgumentParser(description='Convert flat key structure to nested table filtered by VIDEO location.')
    ap.add_argument('input', nargs='?', help='Input text file. If omitted, read from stdin.')
    ap.add_argument('--csv', help='Output CSV path.')
    ap.add_argument('--md', help='Output Markdown path.')
    args = ap.parse_args()

    # Read input
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        text = sys.stdin.read()

    nodes = parse_flat_spec(text)
    rows = to_rows(nodes)
    # Emit outputs
    if args.csv:
        with open(args.csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['Key','Уровень 1','Уровень 2','Уровень 3','Уровень 4','parentId','category','logName','location','interestId'])
            writer.writeheader()
            for r in rows:
                writer.writerow(r)
    if args.md:
        with open(args.md, 'w', encoding='utf-8') as f:
            f.write(rows_to_markdown(rows))

    # If no outputs, print Markdown to stdout
    if not args.csv and not args.md:
        print(rows_to_markdown(rows))

if __name__ == '__main__':
    main()

