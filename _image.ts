function readUint32(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 24) + (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) + bytes[offset + 3];
}

export interface PictureMetadata {
  mime: string;
  width: number;
  height: number;
  colorDepth: number;
  usedColors: number;
}

export function parsePictureMetadata(picture: Uint8Array): PictureMetadata {
  if (picture[0] === 0xFF && picture[1] === 0xD8) {
    return parseJPEG(picture);
  } else if (
    picture[0] === 0x89 && picture[1] === 0x50 && picture[2] === 0x4E &&
    picture[3] === 0x47 && picture[4] === 0x0D && picture[5] === 0x0A &&
    picture[6] === 0x1A && picture[7] === 0x0A
  ) {
    return parsePNG(picture);
  } else if (
    picture[0] === 0x47 && picture[1] === 0x49 && picture[2] === 0x46
  ) {
    return parseGIF(picture);
  } else {
    throw new Error("Unknown picture format.");
  }
}

/**
 * @see https://github.com/xiph/flac/blob/b358381a102a2c1c153ee4cf95dfc04af62faa1a/src/share/grabbag/picture.c#L184
 */
function parseJPEG(bytes: Uint8Array): PictureMetadata {
  let offset = 2;
  while (offset < bytes.length) {
    const next = bytes[offset + 1];
    if (
      bytes[offset] === 0xFF &&
      (next === 0xC0 || next === 0xC1 || next === 0xC2)
    ) {
      offset += 2;
      return {
        mime: "image/jpeg",
        width: (bytes[offset + 5] << 8) + bytes[offset + 6],
        height: (bytes[offset + 3] << 8) + bytes[offset + 4],
        colorDepth: bytes[offset + 2] * bytes[offset + 7],
        usedColors: 0,
      };
    }
    offset += 2;
  }

  throw new Error("Failed to parse JPEG file.");
}

/**
 * @see https://www.w3.org/TR/PNG/
 * @see https://github.com/xiph/flac/blob/b358381a102a2c1c153ee4cf95dfc04af62faa1a/src/share/grabbag/picture.c#L135
 */
function parsePNG(bytes: Uint8Array): PictureMetadata {
  const chunkNameDecoer = new TextDecoder("ascii");

  let offset = 8;
  while (offset < bytes.length) {
    const size = readUint32(bytes, offset);
    offset += 4;
    const chunkName = chunkNameDecoer.decode(
      bytes.subarray(offset, offset + 4),
    );
    offset += 4;
    if (chunkName === "IHDR") {
      break;
    }
    offset += size + 4;
  }

  const width = readUint32(bytes, offset);
  offset += 4;
  const height = readUint32(bytes, offset);
  offset += 4;
  const bitDepth = bytes[offset];
  offset += 1;
  const colorType = bytes[offset];
  offset += 4 + 4;

  const metadata: PictureMetadata = {
    mime: "image/png",
    width,
    height,
    colorDepth: 0,
    usedColors: 0,
  };

  switch (colorType) {
    case 0: // greyscale
      metadata.colorDepth = bitDepth;
      break;
    case 2: // truecolor
      metadata.colorDepth = bitDepth * 3;
      break;
    case 3: // indexed-color
      metadata.colorDepth = bitDepth * 3;
      while (offset < bytes.length) {
        const size = readUint32(bytes, offset);
        offset += 4;
        const chunkName = chunkNameDecoer.decode(
          bytes.subarray(offset, offset + 4),
        );
        offset += 4;
        if (chunkName === "PLTE") {
          metadata.usedColors = size / 3;
          break;
        }
        offset += size + 4;
      }
      break;
    case 4: // greyscale with alpha
      metadata.colorDepth = bitDepth * 2;
      break;
    case 6: // truecolor with alpha
      metadata.colorDepth = bitDepth * 4;
      break;
  }

  return metadata;
}

/**
 * @see https://www.w3.org/Graphics/GIF/spec-gif87.txt
 * @see https://github.com/xiph/flac/blob/b358381a102a2c1c153ee4cf95dfc04af62faa1a/src/share/grabbag/picture.c#L239
 */
function parseGIF(bytes: Uint8Array): PictureMetadata {
  return {
    mime: "image/gif",
    width: bytes[6] + (bytes[7] << 8),
    height: bytes[8] + (bytes[9] << 8),
    colorDepth: 8 * 3,
    usedColors: 1 << ((bytes[10] & 0x07) + 1),
  };
}
