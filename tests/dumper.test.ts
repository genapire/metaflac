import * as fs from 'node:fs/promises'
import { expect, test } from 'vitest'
import { type Metadata, PictureType, dump } from '../src'

test('dump metadata with padding', async () => {
  const metadata: Metadata = {
    streamInfo: {
      minBlockSize: 4096,
      maxBlockSize: 4096,
      minFrameSize: 16,
      maxFrameSize: 16,
      sampleRate: 48000,
      numberOfChannels: 2,
      bitsPerSample: 16,
      totalSamples: 3840,
      signature: 'c911a195060b81c9af5252726a42ccf7',
    },
    application: undefined,
    seekTable: Uint8Array.of(
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x0f,
      0x00
    ),
    vorbisComment: {
      vendor: 'reference libFLAC 1.4.2 20221022',
      comments: [
        { field: 'TITLE', value: '町かどタンジェント' },
        { field: 'ARTIST', value: 'shami momo (小原好美, 鬼頭明里)' },
        { field: 'ALBUM', value: '町かどタンジェント / よいまちカンターレ' },
        { field: 'ALBUMARTIST', value: 'shami momo (小原好美, 鬼頭明里)' },
        { field: 'TRACKNUMBER', value: '1' },
        { field: 'ISRC', value: 'JPPC01901215' },
        { field: 'DATE', value: '2019' },
      ],
    },
    cueSheet: undefined,
    pictures: [
      {
        type: PictureType.FrontCover,
        mime: 'image/png',
        description: '',
        width: 1,
        height: 1,
        colorDepth: 24,
        usedColors: 0,
        picture: await fs.readFile('tests/fixtures/picture.png'),
      },
      {
        type: PictureType.BackCover,
        mime: 'image/jpeg',
        description: 'back cover',
        width: 1,
        height: 1,
        colorDepth: 24,
        usedColors: 0,
        picture: await fs.readFile('tests/fixtures/picture.jpg'),
      },
    ],
  }

  const file = dump(
    metadata,
    await fs.readFile('tests/fixtures/no_metadata.flac'),
    { trailingPadding: 7113 }
  )
  expect(file).toStrictEqual(
    new Uint8Array(await fs.readFile('tests/fixtures/fixture.flac'))
  )
})
