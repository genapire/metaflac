import * as fs from 'node:fs/promises'
import { expect, test } from 'vitest'
import { PictureType, parse } from '../src'

test('throw on non-FLAC file', () => {
  expect(() => {
    parse(Uint8Array.of(0, 0, 0, 0))
  }).toThrow('Invalid FLAC file.')
})

test('throw on missing stream info', () => {
  expect(() => {
    parse(Uint8Array.of(0x66, 0x4c, 0x61, 0x43))
  }).toThrow('Missing streaminfo in FLAC metadata.')
})

test('streaminfo', async () => {
  const file = await fs.readFile('tests/fixtures/fixture.flac')
  const { streamInfo } = parse(file)
  expect(streamInfo.minBlockSize).toBe(4096)
  expect(streamInfo.maxBlockSize).toBe(4096)
  expect(streamInfo.minFrameSize).toBe(16)
  expect(streamInfo.maxFrameSize).toBe(16)
  expect(streamInfo.sampleRate).toBe(48000)
  expect(streamInfo.numberOfChannels).toBe(2)
  expect(streamInfo.bitsPerSample).toBe(16)
  expect(streamInfo.totalSamples).toBe(3840)
  expect(streamInfo.signature).toBe('c911a195060b81c9af5252726a42ccf7')
})

test('seektable', async () => {
  const file = await fs.readFile('tests/fixtures/fixture.flac')
  const { seekTable } = parse(file)
  expect(seekTable).toBeInstanceOf(Uint8Array)
  expect(seekTable).toHaveLength(18)
})

test('vorbis comment', async () => {
  const file = await fs.readFile('tests/fixtures/fixture.flac')
  const vorbisComment = parse(file).vorbisComment!
  expect(vorbisComment.vendor).toBe('reference libFLAC 1.4.2 20221022')
  expect(vorbisComment.comments).toHaveLength(7)
  expect(
    vorbisComment.comments.find(({ field }) => field === 'TITLE')
  ).toStrictEqual({
    field: 'TITLE',
    value: '町かどタンジェント',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'ARTIST')
  ).toStrictEqual({
    field: 'ARTIST',
    value: 'shami momo (小原好美, 鬼頭明里)',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'ALBUM')
  ).toStrictEqual({
    field: 'ALBUM',
    value: '町かどタンジェント / よいまちカンターレ',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'ALBUMARTIST')
  ).toStrictEqual({
    field: 'ALBUMARTIST',
    value: 'shami momo (小原好美, 鬼頭明里)',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'TRACKNUMBER')
  ).toStrictEqual({
    field: 'TRACKNUMBER',
    value: '1',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'ISRC')
  ).toStrictEqual({
    field: 'ISRC',
    value: 'JPPC01901215',
  })
  expect(
    vorbisComment.comments.find(({ field }) => field === 'DATE')
  ).toStrictEqual({
    field: 'DATE',
    value: '2019',
  })
})

test('pictures', async () => {
  const file = await fs.readFile('tests/fixtures/fixture.flac')
  const { pictures } = parse(file)
  expect(pictures).toHaveLength(2)

  const frontCover = pictures[0]
  expect(frontCover.type).toBe(PictureType.FrontCover)
  expect(frontCover.mime).toBe('image/png')
  expect(frontCover.description).toBe('')
  expect(frontCover.width).toBe(1)
  expect(frontCover.height).toBe(1)
  expect(frontCover.colorDepth).toBe(24)
  expect(frontCover.usedColors).toBe(0)
  expect(frontCover.picture).toStrictEqual(
    await fs.readFile('tests/fixtures/picture.png')
  )

  const backCover = pictures[1]
  expect(backCover.type).toBe(PictureType.BackCover)
  expect(backCover.mime).toBe('image/jpeg')
  expect(backCover.description).toBe('back cover')
  expect(backCover.width).toBe(1)
  expect(backCover.height).toBe(1)
  expect(backCover.colorDepth).toBe(24)
  expect(backCover.usedColors).toBe(0)
  expect(backCover.picture).toStrictEqual(
    await fs.readFile('tests/fixtures/picture.jpg')
  )
})
