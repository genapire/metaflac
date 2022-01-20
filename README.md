# 🎶 deno-metaflac

Library for processing metadata of [FLAC (Free Lossless Audio Codec)](https://xiph.org/flac/) files, which can be run on Deno, browsers and Node.js.

> Working in progress.

## 🫕 Usage

```ts
import {
  parse,
  createTagView,
  dump,
} from "https://deno.land/x/metaflac/mod.ts";

const file = await Deno.readFile("./input.flac");
const metadata = parse(file);

const tagView = createTagView(metadata);
// reading tag data
console.log(tagView.artist);
// writing tag data
tagView.title = "xyz";
// removing
tagView.genre = null;

const modifiedFile = dump(metadata, file);
await Deno.writeFile("./output.flac", modifiedFile);
```

## 📃 License

MIT License

Copyright (c) 2021-present Pig Fang
