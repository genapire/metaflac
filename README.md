# 🎶 metaflac

Library for processing metadata of [FLAC (Free Lossless Audio Codec)](https://xiph.org/flac/) files, which can be run on Deno, browsers and Node.js.

## 💿 Installation

```sh
npm i @genapire/metaflac
```

## 🫕 Usage

```ts
import * as fs from 'node:fs/promises'
import { parse, createTagView, dump } from '@genapire/metaflac'

// browsers
const file = await blob.arrayBuffer()
// Node.js
const file = await fs.readFile('./input.flac')
const metadata = parse(file)

const tagView = createTagView(metadata)
// reading tag data
console.log(tagView.artist)
// writing tag data
tagView.title = 'xyz'
// removing
tagView.genre = null

const modifiedFile = dump(metadata, file)
// browsers
new Blob([modifiedFile])
// Node.js
await fs.writeFile('./output.flac', modifiedFile)
```

## 📃 License

MIT License

Copyright (c) 2021-present Pig Fang
Copyright (c) 2025-present genapire
