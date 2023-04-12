import * as fs from 'node:fs/promises'
import { expect, test } from 'vitest'
import { PictureType, createTagView, dump, parse } from '../src'

test('read tags and pictures', async () => {
  const png = await fs.readFile('tests/fixtures/picture.png')
  const jpg = await fs.readFile('tests/fixtures/picture.jpg')

  const input = await fs.readFile('tests/fixtures/fixture.flac')
  const metadata = parse(input)
  const tagView = createTagView(metadata)

  expect(tagView.title).toBe('町かどタンジェント')
  expect(tagView.artist).toBe('shami momo (小原好美, 鬼頭明里)')
  expect(tagView.album).toBe('町かどタンジェント / よいまちカンターレ')
  expect(tagView.albumArtist).toBe('shami momo (小原好美, 鬼頭明里)')
  expect(tagView.track).toBe(1)
  expect(tagView.isrc).toBe('JPPC01901215')
  expect(tagView.date).toBe('2019')
  const frontCover = tagView.findPicture(PictureType.FrontCover)!
  expect(frontCover.picture).toStrictEqual(png)
  const backCover = tagView.findPicture(PictureType.BackCover)!
  expect(backCover.picture).toStrictEqual(jpg)
})

test('write tags and pictures', async () => {
  const input = await fs.readFile('tests/fixtures/fixture.flac')
  const metadata = parse(input)
  const tagView = createTagView(metadata)

  tagView.removePicture(PictureType.BackCover)
  expect(tagView.findPicture(PictureType.BackCover)).toBeUndefined()

  tagView.title = '町かどタンジェント (TV Size)'
  tagView.artist = '小原好美/鬼頭明里'
  tagView.album = '町かどタンジェント'
  tagView.albumArtist = '小原好美/鬼頭明里'
  tagView.track = 5
  tagView.isrc = 'JPPC12345678'
  tagView.date = '2000'
  tagView.attachPicture({
    type: PictureType.FrontCover,
    picture: await fs.readFile('tests/fixtures/picture.gif'),
    description: 'front cover',
  })

  const output = dump(metadata, input, { trailingPadding: 7847 })
  expect(output).toStrictEqual(
    new Uint8Array(await fs.readFile('tests/fixtures/tag_view.flac'))
  )
})

test('remove tags and pictures', async () => {
  const input = await fs.readFile('tests/fixtures/fixture.flac')
  const metadata = parse(input)
  const tagView = createTagView(metadata)

  tagView.removePicture(PictureType.BackCover)
  expect(tagView.findPicture(PictureType.BackCover)).toBeUndefined()
  tagView.removeAllPictures()
  expect(tagView.findPicture(PictureType.FrontCover)).toBeUndefined()

  tagView.title = null
  tagView.artist = null
  tagView.album = null
  tagView.albumArtist = null
  tagView.track = null
  tagView.isrc = null
  tagView.date = null
  tagView.removeAllPictures()

  const output = dump(metadata, input, { trailingPadding: 8192 })
  expect(output).toStrictEqual(
    new Uint8Array(await fs.readFile('tests/fixtures/no_tags.flac'))
  )
})
