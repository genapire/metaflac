import { assertFlacFile, FLAG_IS_LAST_BLOCK } from "./_shared.ts";
import { BlockType, PictureType } from "./types.ts";
import type {
  Metadata,
  Picture,
  SeekPoint,
  StreamInfo,
  VorbisComment,
  VorbisCommentContent,
} from "./types.ts";

export function parse(bytes: Uint8Array): Metadata {
  assertFlacFile(bytes);

  let streamInfo: StreamInfo | undefined;
  let seekTable: SeekPoint[] | undefined;
  let vorbisComment: VorbisComment | undefined;
  const pictures: Picture[] = [];

  let offset = 4;
  let isLastBlock = false;
  while (!isLastBlock) {
    const header = parseBlockHeader(bytes.subarray(offset));
    isLastBlock = header.isLastBlock;
    offset += 4;

    const block = bytes.subarray(offset, offset + header.blockSize);
    switch (header.blockType) {
      case BlockType.Streaminfo:
        streamInfo = parseStreamInfo(block);
        break;
      case BlockType.Padding:
        break;
      case BlockType.Seektable:
        seekTable = parseSeekTable(block);
        break;
      case BlockType.VorbisComment:
        vorbisComment = parseVorbisComment(block);
        break;
      case BlockType.Picture:
        pictures.push(parsePicture(block));
        break;
    }

    offset += header.blockSize;
  }

  if (!streamInfo) {
    throw new Error("Missing streaminfo in FLAC metadata.");
  }

  return {
    streamInfo,
    seekTable,
    vorbisComment,
    pictures,
  };
}

interface BlockHeader {
  isLastBlock: boolean;
  blockType: BlockType;
  blockSize: number;
}

function parseBlockHeader(bytes: Uint8Array): BlockHeader {
  const isLastBlock = !!(bytes[0] & FLAG_IS_LAST_BLOCK);

  const blockTypeRaw = (bytes[0] & 0b01111111);
  const blockType: BlockType =
    blockTypeRaw >= BlockType.Reserved && blockTypeRaw !== BlockType.Invalid
      ? BlockType.Reserved
      : blockTypeRaw;

  const blockSize = (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];

  return {
    isLastBlock,
    blockType,
    blockSize,
  };
}

function parseStreamInfo(bytes: Uint8Array): StreamInfo {
  const minBlockSize = (bytes[0] << 8) + bytes[1];
  const maxBlockSize = (bytes[2] << 8) + bytes[3];
  const minFrameSize = (bytes[4] << 16) + (bytes[5] << 8) + bytes[6];
  const maxFrameSize = (bytes[7] << 16) + (bytes[8] << 8) + bytes[9];
  const sampleRate = (bytes[10] << 12) + (bytes[11] << 4) + (bytes[12] >> 4);
  const numberOfChannels = ((bytes[12] & 0b00001110) >> 1) + 1;
  const bitsPerSample = ((bytes[12] & 0b00000001) << 4) + (bytes[13] >> 4) + 1;
  const totalSamples = ((bytes[13] & 0b00001111) << 32) + (bytes[14] << 24) +
    (bytes[15] << 16) + (bytes[16] << 8) + bytes[17];
  const signature = bytes.subarray(18, 34).reduce(
    (s, byte) => s + byte.toString(16).padStart(2, "0"),
    "",
  );

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
  };
}

function parseSeekTable(bytes: Uint8Array): SeekPoint[] {
  const table: SeekPoint[] = [];
  for (let i = 0; i < bytes.length / 18; i += 1) {
    const start = i * 18;
    table.push({
      sampleNumber: (bytes[start] << 56) + (bytes[start + 1] << 48) +
        (bytes[start + 2] << 40) + (bytes[start + 3] << 32) +
        (bytes[start + 4] << 24) + (bytes[start + 5] << 16) +
        (bytes[start + 6] << 8) + bytes[start + 7],
      offset: (bytes[start + 8] << 56) + (bytes[start + 9] << 48) +
        (bytes[start + 10] << 40) + (bytes[start + 11] << 32) +
        (bytes[start + 12] << 24) + (bytes[start + 13] << 16) +
        (bytes[start + 14] << 8) + bytes[start + 15],
      numberOfSamples: (bytes[start + 16] << 8) + bytes[start + 17],
    });
  }

  return table;
}

function parseVorbisComment(bytes: Uint8Array): VorbisComment {
  const textDecoder = new TextDecoder("utf-8");
  let offset = 0;
  const vendorLength = parseVorbisCommentLength(bytes, offset);
  offset += 4;
  const vendor = textDecoder.decode(
    bytes.subarray(offset, offset + vendorLength),
  );
  offset += vendorLength + 4;

  const comments = Array
    .from({ length: parseVorbisCommentLength(bytes, offset - 4) })
    .map<VorbisCommentContent>(
      () => {
        const length = parseVorbisCommentLength(bytes, offset);
        offset += 4;

        const commentContent = bytes.subarray(offset, offset + length);
        offset += length;

        const separator = commentContent.indexOf(61); // "="
        const field = textDecoder.decode(commentContent.subarray(0, separator));
        const value = textDecoder.decode(
          commentContent.subarray(separator + 1),
        );
        return { field, value };
      },
    );

  return {
    vendor,
    comments,
  };
}

function parseVorbisCommentLength(bytes: Uint8Array, offset: number): number {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) +
    (bytes[offset + 3] << 24);
}

function parsePicture(bytes: Uint8Array): Picture {
  const textDecoder = new TextDecoder("utf-8");
  const type: PictureType = bytes[3];
  let offset = 4;

  const mimeLength = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;
  const mime = textDecoder.decode(bytes.subarray(offset, offset + mimeLength));
  offset += mimeLength;

  const descriptionLength = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;
  const description = textDecoder.decode(
    bytes.subarray(offset, offset + descriptionLength),
  );
  offset += descriptionLength;

  const width = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;
  const height = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;

  const colorDepth = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;
  const usedColors = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;

  const pictureLength = (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
  offset += 4;
  const picture = bytes.slice(offset, offset + pictureLength);

  return {
    type,
    mime,
    description,
    width,
    height,
    colorDepth,
    usedColors,
    picture,
  };
}
