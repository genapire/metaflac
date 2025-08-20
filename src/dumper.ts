import {assertFlacFile, FLAG_IS_LAST_BLOCK} from './shared.js'
import type {Metadata, Picture, StreamInfo, VorbisComment} from './types.js'
import {BlockType} from './types.js'

export interface DumperOptions {
    /** Add specific size of padding after all metadata blocks. */
    trailingPadding?: number;
}

export function dump(
    metadata: Metadata,
    file: Uint8Array,
    options: DumperOptions = {},
): Uint8Array {
    assertFlacFile(file);

    type Block = { type: BlockType, bytes: Uint8Array }
    const blocks: Block[] = [];
    blocks.push({
        type: BlockType.Streaminfo,
        bytes: dumpStreamInfo(metadata.streamInfo),
    });
    if (metadata.application) {
        blocks.push({
            type: BlockType.Application,
            bytes: metadata.application,
        });
    }
    if (metadata.seekTable) {
        blocks.push({
            type: BlockType.Seektable,
            bytes: metadata.seekTable,
        });
    }
    if (metadata.vorbisComment) {
        blocks.push({
            type: BlockType.VorbisComment,
            bytes: dumpVorbisComment(metadata.vorbisComment),
        });
    }
    if (metadata.cueSheet) {
        blocks.push({
            type: BlockType.Cuesheet,
            bytes: metadata.cueSheet,
        });
    }
    metadata.pictures.forEach((picture) => {
        blocks.push({
            type: BlockType.Picture,
            bytes: dumpPicture(picture),
        });
    });
    if (options.trailingPadding) {
        blocks.push({
            type: BlockType.Padding,
            bytes: new Uint8Array(options.trailingPadding),
        });
    }

    return concat(
        Uint8Array.of(102, 76, 97, 67), // "fLaC"
        ...blocks.map(({type, bytes}, index, blocks) =>
            dumpBlock(index === blocks.length - 1, type, bytes),
        ),
        file.subarray(skipMetadata(file)),
    );
}

function dumpBlock(
    isLastBlock: boolean,
    type: BlockType,
    data: Uint8Array,
): Uint8Array {
    const header = (isLastBlock ? FLAG_IS_LAST_BLOCK : 0) + type;
    const blockSize = data.length;
    return concat(Uint8Array.of(header), dumpNumber(blockSize, 3), data);
}

function dumpStreamInfo(streamInfo: StreamInfo): Uint8Array {
    const {signature} = streamInfo;
    const md5 = new Uint8Array(16);
    for (let i = 0; i < md5.length; i++) {
        md5[i] = Number.parseInt(signature.slice(i * 2, i * 2 + 2), 16);
    }

    const totalSamples = BigInt(streamInfo.totalSamples);

    return concat(
        dumpNumber(streamInfo.minBlockSize, 2),
        dumpNumber(streamInfo.maxBlockSize, 2),
        dumpNumber(streamInfo.minFrameSize, 3),
        dumpNumber(streamInfo.maxFrameSize, 3),
        Uint8Array.of(
            (streamInfo.sampleRate >> 12) & 0xFF,
            (streamInfo.sampleRate >> 4) & 0xFF,
            ((streamInfo.sampleRate & 0xF) << 4)                    // sample rate low 4 bity (high nibble bajtu 12)
            | (((streamInfo.numberOfChannels - 1) & 0x7) << 1)    // channels (3 bity)
            | (((streamInfo.bitsPerSample - 1) >> 4) & 0x1),

            (((streamInfo.bitsPerSample - 1) & 0xF) << 4)         // upper 4 bits bitsPerSample in high nibble
            | Number((totalSamples >> 32n) & 0xFn),                // highest 4 bits totalSamples in low nibble

            Number((totalSamples >> 24n) & 0xFFn),
            Number((totalSamples >> 16n) & 0xFFn),
            Number((totalSamples >> 8n) & 0xFFn),
            Number(totalSamples & 0xFFn),
        ),
        md5,
    );
}

const textEncoder = new TextEncoder();

function dumpVorbisComment(vorbisComment: VorbisComment): Uint8Array {
    const vendor = textEncoder.encode(vorbisComment.vendor);
    const comments = vorbisComment.comments.map((comment) => {
        const content = textEncoder.encode(`${comment.field}=${comment.value}`);
        return concat(dumpVorbisCommentLength(content.length), content);
    });

    return concat(
        dumpVorbisCommentLength(vendor.length),
        vendor,
        dumpVorbisCommentLength(vorbisComment.comments.length),
        ...comments,
    );
}

function dumpVorbisCommentLength(length: number): Uint8Array {
    return Uint8Array.of(length, length >> 8, length >> 16, length >> 24);
}

function dumpPicture(picture: Picture): Uint8Array {
    const type = Uint8Array.of(0, 0, 0, picture.type);
    const mime = textEncoder.encode(picture.mime);
    const description = textEncoder.encode(picture.description);

    return concat(
        type,
        dumpNumber(mime.length, 4),
        mime,
        dumpNumber(description.length, 4),
        description,
        dumpNumber(picture.width, 4),
        dumpNumber(picture.height, 4),
        dumpNumber(picture.colorDepth, 4),
        dumpNumber(picture.usedColors, 4),
        dumpNumber(picture.picture.length, 4),
        picture.picture,
    );
}

function dumpNumber(n: number, length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
        bytes[i] = n >> ((length - 1 - i) * 8);
    }
    return bytes;
}

function skipMetadata(bytes: Uint8Array): number {
    let offset = 4;

    let isLastBlock = false;
    while (!isLastBlock) {
        if (offset + 3 >= bytes.length) {
            throw new Error('Unexpected end of FLAC metadata while skipping blocks');
        }
        isLastBlock = !!(bytes[offset]! & FLAG_IS_LAST_BLOCK);
        offset += 4 +
            (bytes[offset + 1]! << 16) +
            (bytes[offset + 2]! << 8) +
            bytes[offset + 3]!;
    }

    return offset;
}

function concat(...buffers: Uint8Array[]): Uint8Array {
    const length = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const result = new Uint8Array(length);
    buffers.reduce((offset, buffer) => {
        result.set(buffer, offset);
        return offset + buffer.length;
    }, 0);

    return result;
}
