#!/usr/bin/env python3
"""Skleja moduły z src/ w jeden działający plik kosmos_dla_corki.html.

Kolejność: head.html, consts.js, fx.js, music.js, assets.js, sky.js, data.js,
core.js (ze speech.js i ui.js w znacznikach //__SPEECH__ oraz //__UI__),
probes.js, activities.js (z tasks2.js w znaczniku //__TASKS_MORE__), controls.js. Obrazy z src/img/ lądują w assets.js
jako data URI.
"""
import base64
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
OUT = ROOT / 'kosmos_dla_corki.html'

MIME = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif'}


def read(name):
    return (SRC / name).read_text(encoding='utf-8')


def asset_mapping():
    data = {}
    for path in sorted((SRC / 'img').iterdir()):
        suffix = path.suffix.lower()
        if suffix not in MIME:
            continue
        encoded = base64.b64encode(path.read_bytes()).decode('ascii')
        data[path.stem] = f'data:{MIME[suffix]};base64,{encoded}'
    return data


def main():
    assets = read('assets.js').replace('/*ASSET_DATA*/{}', json.dumps(asset_mapping(), ensure_ascii=False))
    core = read('core.js')
    core = core.replace('//__SPEECH__', read('speech.js'))
    core = core.replace('//__UI__', read('ui.js'))
    parts = [
        read('head.html'),
        read('consts.js'),
        read('fx.js'),
        read('music.js'),
        assets,
        read('sky.js'),
        read('data.js'),
        core,
        read('probes.js'),
        read('activities.js').replace('//__TASKS_MORE__', read('tasks2.js')),
        read('controls.js'),
    ]
    OUT.write_text('\n'.join(parts), encoding='utf-8')
    print(f'OK: {OUT} ({OUT.stat().st_size} bajtów)')


if __name__ == '__main__':
    main()
