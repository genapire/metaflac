export var BlockType;
(function (BlockType) {
    BlockType[BlockType["Streaminfo"] = 0] = "Streaminfo";
    BlockType[BlockType["Padding"] = 1] = "Padding";
    BlockType[BlockType["Application"] = 2] = "Application";
    BlockType[BlockType["Seektable"] = 3] = "Seektable";
    BlockType[BlockType["VorbisComment"] = 4] = "VorbisComment";
    BlockType[BlockType["Cuesheet"] = 5] = "Cuesheet";
    BlockType[BlockType["Picture"] = 6] = "Picture";
    BlockType[BlockType["Reserved"] = 7] = "Reserved";
    BlockType[BlockType["Invalid"] = 127] = "Invalid";
})(BlockType || (BlockType = {}));
// same with ID3v2
export var PictureType;
(function (PictureType) {
    PictureType[PictureType["Other"] = 0] = "Other";
    /** 32x32 pixels, PNG only */
    PictureType[PictureType["FileIcon"] = 1] = "FileIcon";
    PictureType[PictureType["OtherFileIcon"] = 2] = "OtherFileIcon";
    PictureType[PictureType["FrontCover"] = 3] = "FrontCover";
    PictureType[PictureType["BackCover"] = 4] = "BackCover";
    PictureType[PictureType["LeafletPage"] = 5] = "LeafletPage";
    PictureType[PictureType["Media"] = 6] = "Media";
    PictureType[PictureType["LeadArtist"] = 7] = "LeadArtist";
    PictureType[PictureType["Artist"] = 8] = "Artist";
    PictureType[PictureType["Conductor"] = 9] = "Conductor";
    PictureType[PictureType["Orchestra"] = 10] = "Orchestra";
    PictureType[PictureType["Composer"] = 11] = "Composer";
    PictureType[PictureType["Lyricist"] = 12] = "Lyricist";
    PictureType[PictureType["RecordingLocation"] = 13] = "RecordingLocation";
    PictureType[PictureType["DuringRecording"] = 14] = "DuringRecording";
    PictureType[PictureType["DuringPerformance"] = 15] = "DuringPerformance";
    PictureType[PictureType["Movie"] = 16] = "Movie";
    PictureType[PictureType["ABrightColoredFish"] = 17] = "ABrightColoredFish";
    PictureType[PictureType["Illustration"] = 18] = "Illustration";
    PictureType[PictureType["ArtistLogotype"] = 19] = "ArtistLogotype";
    PictureType[PictureType["Publisher"] = 20] = "Publisher";
})(PictureType || (PictureType = {}));
//# sourceMappingURL=types.js.map