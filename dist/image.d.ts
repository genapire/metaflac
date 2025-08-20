export interface PictureMetadata {
    mime: string;
    width: number;
    height: number;
    colorDepth: number;
    usedColors: number;
}
export declare function parsePictureMetadata(picture: Uint8Array): PictureMetadata;
