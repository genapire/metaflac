import {assertFlacFile, FLAG_IS_LAST_BLOCK} from './shared.js'
import type {Metadata, Picture, StreamInfo, VorbisComment, VorbisCommentContent} from './types.js'
import {BlockType, type PictureType} from './types.js'

export function parse(bytes: Uint8Array): Metadata {
    assertFlacFile(bytes)

    let streamInfo: StreamInfo | undefined
    let application: Uint8Array | undefined
    let seekTable: Uint8Array | undefined
    let vorbisComment: VorbisComment | undefined
    let cueSheet: Uint8Array | undefined
    const pictures: Picture[] = []

    let offset = 4
    let isLastBlock = false
    while (!isLastBlock && offset < bytes.length) {
        const header = parseBlockHeader(bytes.subarray(offset))
        isLastBlock = header.isLastBlock
        offset += 4

        const block = bytes.subarray(offset, offset + header.blockSize)
        switch (header.blockType) {
            case BlockType.Streaminfo:
                streamInfo = parseStreamInfo(block)
                break
            case BlockType.Padding:
                break
            case BlockType.Application:
                application = block
                break
            case BlockType.Seektable:
                seekTable = block
                break
            case BlockType.VorbisComment:
                vorbisComment = parseVorbisComment(block)
                break
            case BlockType.Cuesheet:
                cueSheet = block
                break
            case BlockType.Picture:
                pictures.push(parsePicture(block))
                break
        }

        offset += header.blockSize
    }

    if (!streamInfo) {
        throw new Error('Missing streaminfo in FLAC metadata.')
    }

    return {
        streamInfo,
        application,
        seekTable,
        vorbisComment,
        cueSheet,
        pictures,
    }
}

interface BlockHeader {
    isLastBlock: boolean
    blockType: BlockType
    blockSize: number
}

function parseBlockHeader(bytes: Uint8Array): BlockHeader {
    if (bytes.length < 4) {
        throw new Error('Insufficient bytes for FLAC block header')
    }
    const isLastBlock = !!(bytes[0]! & FLAG_IS_LAST_BLOCK)
    const blockTypeRaw = bytes[0]! & 0b01111111
    const blockType: BlockType =
        blockTypeRaw >= BlockType.Reserved && blockTypeRaw !== BlockType.Invalid
            ? BlockType.Reserved
            : blockTypeRaw
    const blockSize = parseNumber(bytes, 1, 3)

    return {
        isLastBlock,
        blockType,
        blockSize,
    }
}

function parseStreamInfo(bytes: Uint8Array): StreamInfo {
    if (bytes.length < 34) {
        throw new Error('Insufficient bytes for FLAC STREAMINFO block')
    }
    const minBlockSize = parseNumber(bytes, 0, 2)
    const maxBlockSize = parseNumber(bytes, 2, 2)
    const minFrameSize = parseNumber(bytes, 4, 3)
    const maxFrameSize = parseNumber(bytes, 7, 3)
    const sampleRate = (bytes[10]! << 12) + (bytes[11]! << 4) + (bytes[12]! >> 4)
    const numberOfChannels = ((bytes[12]! & 0b00001110) >> 1) + 1
    const bitsPerSample = ((bytes[12]! & 0b00000001) << 4) + (bytes[13]! >> 4) + 1
    const totalSamples = Number(
        (BigInt(bytes[13]! & 0b00001111) << 32n) +
        (BigInt(bytes[14]!) << 24n) +
        (BigInt(bytes[15]!) << 16n) +
        (BigInt(bytes[16]!) << 8n) +
        BigInt(bytes[17]!)
    )
    const signature = bytes
        .subarray(18, 34)
        .reduce((s, byte) => s + byte.toString(16).padStart(2, '0'), '')

    return {
        minBlockSize,
        maxBlockSize,
        minFrameSize,
        maxFrameSize,
        sampleRate,
        numberOfChannels,
        bitsPerSample,
        totalSamples,
        signature,
    }
}

function parseVorbisComment(bytes: Uint8Array): VorbisComment {
    const textDecoder = new TextDecoder('utf-8')
    let offset = 0
    const vendorLength = parseVorbisCommentLength(bytes, offset)
    offset += 4
    const vendor = textDecoder.decode(
        bytes.subarray(offset, offset + vendorLength)
    )
    offset += vendorLength + 4

    const comments = Array.from({
        length: parseVorbisCommentLength(bytes, offset - 4),
    }).map<VorbisCommentContent>(() => {
        const length = parseVorbisCommentLength(bytes, offset)
        offset += 4

        const commentContent = bytes.subarray(offset, offset + length)
        offset += length

        const separator = commentContent.indexOf(61) // "="
        const field = textDecoder.decode(commentContent.subarray(0, separator))
        const value = textDecoder.decode(commentContent.subarray(separator + 1))
        return {field, value}
    })

    return {
        vendor,
        comments,
    }
}

function parseVorbisCommentLength(bytes: Uint8Array, offset: number): number {
    if (offset + 3 >= bytes.length) {
        throw new Error('Insufficient bytes for Vorbis comment length')
    }
    return (
        bytes[offset]! +
        (bytes[offset + 1]! << 8) +
        (bytes[offset + 2]! << 16) +
        (bytes[offset + 3]! << 24)
    )
}

function parsePicture(bytes: Uint8Array): Picture {
    if (bytes.length < 4) {
        throw new Error('Insufficient bytes for FLAC picture block')
    }
    const typeValue = bytes[3]
    if (typeValue === undefined || isNaN(typeValue)) {
        throw new Error('Invalid picture type')
    }
    const type: PictureType = typeValue as PictureType
    let offset = 4

    const mimeLength = parseNumber(bytes, offset, 4)
    offset += 4
    const mime = new TextDecoder('utf-8').decode(bytes.subarray(offset, offset + mimeLength))
    offset += mimeLength

    const descriptionLength = parseNumber(bytes, offset, 4)
    offset += 4
    const description = new TextDecoder('utf-8').decode(
        bytes.subarray(offset, offset + descriptionLength)
    )
    offset += descriptionLength

    const width = parseNumber(bytes, offset, 4)
    offset += 4
    const height = parseNumber(bytes, offset, 4)
    offset += 4

    const colorDepth = parseNumber(bytes, offset, 4)
    offset += 4
    const usedColors = parseNumber(bytes, offset, 4)
    offset += 4

    const pictureLength = parseNumber(bytes, offset, 4)
    offset += 4
    const picture = bytes.slice(offset, offset + pictureLength)

    return {
        type,
        mime,
        description,
        width,
        height,
        colorDepth,
        usedColors,
        picture,
    }
}

function parseNumber(
    bytes: Uint8Array,
    offset: number,
    length: number,
): number {
    return bytes
        .subarray(offset, offset + length)
        .reduce(
            (total, current, i) => total + (current << ((length - 1 - i) * 8)),
            0
        )
}
