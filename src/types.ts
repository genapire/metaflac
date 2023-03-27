export enum BlockType {
  Streaminfo,
  Padding,
  Application,
  Seektable,
  VorbisComment,
  Cuesheet,
  Picture,
  Reserved,
  Invalid = 127,
}

export interface Metadata {
  streamInfo: StreamInfo
  seekTable: Uint8Array | undefined
  vorbisComment: VorbisComment | undefined
  pictures: Picture[]
}

export interface StreamInfo {
  minBlockSize: number
  maxBlockSize: number
  minFrameSize: number
  maxFrameSize: number
  sampleRate: number
  numberOfChannels: number
  bitsPerSample: number
  totalSamples: number
  signature: string
}

export interface VorbisComment {
  vendor: string
  comments: VorbisCommentContent[]
}

export interface VorbisCommentContent {
  field: string
  value: string
}

export interface Picture {
  type: PictureType
  mime: string
  description: string
  width: number
  height: number
  colorDepth: number
  usedColors: number
  picture: Uint8Array
}

// same with ID3v2
export enum PictureType {
  Other,
  /** 32x32 pixels, PNG only */
  FileIcon,
  OtherFileIcon,
  FrontCover,
  BackCover,
  LeafletPage,
  Media,
  LeadArtist,
  Artist,
  Conductor,
  Orchestra,
  Composer,
  Lyricist,
  RecordingLocation,
  DuringRecording,
  DuringPerformance,
  Movie,
  ABrightColoredFish,
  Illustration,
  ArtistLogotype,
  Publisher,
}
