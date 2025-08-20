export declare enum BlockType {
    Streaminfo = 0,
    Padding = 1,
    Application = 2,
    Seektable = 3,
    VorbisComment = 4,
    Cuesheet = 5,
    Picture = 6,
    Reserved = 7,
    Invalid = 127
}
export interface Metadata {
    streamInfo: StreamInfo;
    application: Uint8Array | undefined;
    seekTable: Uint8Array | undefined;
    vorbisComment: VorbisComment | undefined;
    cueSheet: Uint8Array | undefined;
    pictures: Picture[];
}
export interface StreamInfo {
    minBlockSize: number;
    maxBlockSize: number;
    minFrameSize: number;
    maxFrameSize: number;
    sampleRate: number;
    numberOfChannels: number;
    bitsPerSample: number;
    totalSamples: number;
    signature: string;
}
export interface VorbisComment {
    vendor: string;
    comments: VorbisCommentContent[];
}
export interface VorbisCommentContent {
    field: string;
    value: string;
}
export interface Picture {
    type: PictureType;
    mime: string;
    description: string;
    width: number;
    height: number;
    colorDepth: number;
    usedColors: number;
    picture: Uint8Array;
}
export declare enum PictureType {
    Other = 0,
    /** 32x32 pixels, PNG only */
    FileIcon = 1,
    OtherFileIcon = 2,
    FrontCover = 3,
    BackCover = 4,
    LeafletPage = 5,
    Media = 6,
    LeadArtist = 7,
    Artist = 8,
    Conductor = 9,
    Orchestra = 10,
    Composer = 11,
    Lyricist = 12,
    RecordingLocation = 13,
    DuringRecording = 14,
    DuringPerformance = 15,
    Movie = 16,
    ABrightColoredFish = 17,
    Illustration = 18,
    ArtistLogotype = 19,
    Publisher = 20
}
