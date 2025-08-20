function readUint32(bytes, offset) {
    if (offset + 3 >= bytes.length) {
        throw new Error('Insufficient bytes to read Uint32');
    }
    return ((bytes[offset] << 24) +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3]);
}
export function parsePictureMetadata(picture) {
    if (picture[0] === 0xff && picture[1] === 0xd8) {
        return parseJPEG(picture);
    }
    else if (picture[0] === 0x89 &&
        picture[1] === 0x50 &&
        picture[2] === 0x4e &&
        picture[3] === 0x47 &&
        picture[4] === 0x0d &&
        picture[5] === 0x0a &&
        picture[6] === 0x1a &&
        picture[7] === 0x0a) {
        return parsePNG(picture);
    }
    else if (picture[0] === 0x47 &&
        picture[1] === 0x49 &&
        picture[2] === 0x46) {
        return parseGIF(picture);
    }
    else {
        throw new Error('Unknown picture format.');
    }
}
/**
 * @see https://github.com/xiph/flac/blob/b358381a102a2c1c153ee4cf95dfc04af62faa1a/src/share/grabbag/picture.c#L184
 */
function parseJPEG(bytes) {
    let offset = 2;
    while (offset < bytes.length) {
        if (offset + 7 >= bytes.length) {
            break;
        }
        const next = bytes[offset + 1];
        if (bytes[offset] === 0xff &&
            (next === 0xc0 || next === 0xc1 || next === 0xc2)) {
            offset += 2;
            if (offset + 7 >= bytes.length) {
                break;
            }
            return {
                mime: 'image/jpeg',
                width: (bytes[offset + 5] << 8) + bytes[offset + 6],
                height: (bytes[offset + 3] << 8) + bytes[offset + 4],
                colorDepth: bytes[offset + 2] * bytes[offset + 7],
                usedColors: 0,
            };
        }
        offset += 2;
    }
    throw new Error('Failed to parse JPEG file.');
}
/**
 * @see https://www.w3.org/TR/PNG/
 * @see https://github.com/xiph/flac/blob/b358381a102a2c1c153ee4cf95dfc04af62faa1a/src/share/grabbag/picture.c#L135
 */
function parsePNG(bytes) {
    const chunkNameDecoer = new TextDecoder('ascii');
    let offset = 8;
    while (offset < bytes.length) {
        if (offset + 7 >= bytes.length) {
            throw new Error('Insufficient bytes for PNG chunk');
        }
        const size = readUint32(bytes, offset);
        offset += 4;
        const chunkName = chunkNameDecoer.decode(bytes.subarray(offset, offset + 4));
        offset += 4;
        if (chunkName === 'IHDR') {
            break;
        }
        offset += size + 4;
    }
    if (offset + 8 >= bytes.length) {
        throw new Error('Insufficient bytes for PNG IHDR data');
    }
    const width = readUint32(bytes, offset);
    offset += 4;
    const height = readUint32(bytes, offset);
    offset += 4;
    const bitDepth = bytes[offset];
    offset += 1;
    const colorType = bytes[offset];
    offset += 4 + 4;
    if (bitDepth === undefined) {
        throw new Error('Missing bitDepth in PNG');
    }
    const metadata = {
        mime: 'image/png',
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
                if (offset + 7 >= bytes.length) {
                    break;
                }
                const size = readUint32(bytes, offset);
                offset += 4;
                const chunkName = chunkNameDecoer.decode(bytes.subarray(offset, offset + 4));
                offset += 4;
                if (chunkName === 'PLTE') {
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
function parseGIF(bytes) {
    if (bytes.length < 11) {
        throw new Error('Insufficient bytes for GIF metadata');
    }
    return {
        mime: 'image/gif',
        width: bytes[6] + (bytes[7] << 8),
        height: bytes[8] + (bytes[9] << 8),
        colorDepth: 8 * 3,
        usedColors: 1 << ((bytes[10] & 0x07) + 1),
    };
}
//# sourceMappingURL=image.js.map