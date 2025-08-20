import { parsePictureMetadata } from './image.js';
export function createTagView(metadata) {
    metadata.vorbisComment ??= { vendor: "", comments: [] };
    const { vorbisComment } = metadata;
    return {
        get trackTotal() {
            const value = queryCommentValue(vorbisComment, "TRACKTOTAL");
            return value ? Number.parseInt(value).toFixed(0) : undefined;
        },
        get discNumber() {
            const value = queryCommentValue(vorbisComment, "DISCNUMBER");
            return value ? Number.parseInt(value).toFixed(0) : undefined;
        },
        get discTotal() {
            const value = queryCommentValue(vorbisComment, "DISCTOTAL");
            return value ? Number.parseInt(value).toFixed(0) : undefined;
        },
        get composer() {
            return queryCommentValue(vorbisComment, "COMPOSER");
        },
        set composer(value) {
            setOrRemoveComment(vorbisComment, "COMPOSER", value);
        },
        get lyrics() {
            return queryCommentValue(vorbisComment, "LYRICS");
        },
        get title() {
            return queryCommentValue(vorbisComment, "TITLE");
        },
        set title(value) {
            setOrRemoveComment(vorbisComment, "TITLE", value);
        },
        get artist() {
            return queryCommentValue(vorbisComment, "ARTIST");
        },
        set artist(value) {
            setOrRemoveComment(vorbisComment, "ARTIST", value);
        },
        get album() {
            return queryCommentValue(vorbisComment, "ALBUM");
        },
        set album(value) {
            setOrRemoveComment(vorbisComment, "ALBUM", value);
        },
        get albumArtist() {
            return (queryCommentValue(vorbisComment, "ALBUMARTIST") ??
                queryCommentValue(vorbisComment, "ALBUM ARTIST"));
        },
        set albumArtist(value) {
            setOrRemoveComment(vorbisComment, "ALBUMARTIST", value);
            setOrRemoveComment(vorbisComment, "ALBUM ARTIST", value);
        },
        get track() {
            const value = queryCommentValue(vorbisComment, "TRACKNUMBER");
            return value ? Number.parseInt(value) : undefined;
        },
        set track(value) {
            setOrRemoveComment(vorbisComment, "TRACKNUMBER", value?.toFixed(0));
        },
        get date() {
            return queryCommentValue(vorbisComment, "DATE");
        },
        set date(value) {
            setOrRemoveComment(vorbisComment, "DATE", value);
        },
        get genre() {
            return queryCommentValue(vorbisComment, "GENRE");
        },
        set genres(values) {
            setOrRemoveManyComment(vorbisComment, "GENRE", values);
        },
        get version() {
            return queryCommentValue(vorbisComment, "VERSION");
        },
        set version(value) {
            setOrRemoveComment(vorbisComment, "VERSION", value);
        },
        get performer() {
            return queryCommentValue(vorbisComment, "PERFORMER");
        },
        set performer(value) {
            setOrRemoveComment(vorbisComment, "PERFORMER", value);
        },
        get copyright() {
            return queryCommentValue(vorbisComment, "COPYRIGHT");
        },
        set copyright(value) {
            setOrRemoveComment(vorbisComment, "COPYRIGHT", value);
        },
        get license() {
            return queryCommentValue(vorbisComment, "LICENSE");
        },
        set license(value) {
            setOrRemoveComment(vorbisComment, "LICENSE", value);
        },
        get organization() {
            return queryCommentValue(vorbisComment, "ORGANIZATION");
        },
        set organization(value) {
            setOrRemoveComment(vorbisComment, "ORGANIZATION", value);
        },
        get description() {
            return queryCommentValue(vorbisComment, "DESCRIPTION");
        },
        set description(value) {
            setOrRemoveComment(vorbisComment, "DESCRIPTION", value);
        },
        get location() {
            return queryCommentValue(vorbisComment, "LOCATION");
        },
        set location(value) {
            setOrRemoveComment(vorbisComment, "LOCATION", value);
        },
        get contact() {
            return queryCommentValue(vorbisComment, "CONTACT");
        },
        set contact(value) {
            setOrRemoveComment(vorbisComment, "CONTACT", value);
        },
        get isrc() {
            return queryCommentValue(vorbisComment, "ISRC");
        },
        set isrc(value) {
            setOrRemoveComment(vorbisComment, "ISRC", value);
        },
        findPicture(type) {
            return metadata.pictures.find((picture) => picture.type === type);
        },
        attachPicture(options) {
            let picture;
            if (!options.mime ||
                !options.width ||
                !options.height ||
                !options.colorDepth ||
                !options.usedColors) {
                picture = {
                    ...parsePictureMetadata(options.picture),
                    ...options,
                    description: options.description ?? "",
                };
            }
            else {
                picture = {
                    ...options,
                    description: options.description ?? "",
                };
            }
            const existing = metadata.pictures.find(({ type }) => type === options.type);
            if (existing) {
                Object.assign(existing, picture);
            }
            else {
                metadata.pictures.push(picture);
            }
        },
        removePicture(type) {
            metadata.pictures = metadata.pictures.filter((picture) => picture.type !== type);
        },
        removeAllPictures() {
            metadata.pictures = [];
        },
    };
}
function queryCommentValue(vorbisComment, field) {
    return vorbisComment.comments.find((comment) => comment.field.toUpperCase() === field)?.value;
}
function setOrRemoveComment(vorbisComment, field, value) {
    if (value == null) {
        vorbisComment.comments = vorbisComment.comments.filter((comment) => comment.field.toUpperCase() !== field);
        return;
    }
    const comment = vorbisComment.comments.find((comment) => comment.field.toUpperCase() === field);
    if (comment) {
        comment.value = value;
    }
    else {
        vorbisComment.comments.push({ field: field.toLocaleLowerCase(), value });
    }
}
function setOrRemoveManyComment(vorbisComment, field, values) {
    if (values == null) {
        vorbisComment.comments = vorbisComment.comments.filter((comment) => comment.field.toUpperCase() !== field);
        return;
    }
    const existingCommentValues = vorbisComment.comments.filter((comment) => comment.field.toUpperCase() === field).map(c => c.value);
    values.filter(c => !existingCommentValues.includes(c)).forEach((value) => vorbisComment.comments.push({
        field: field.toLocaleLowerCase(),
        value
    }));
}
//# sourceMappingURL=tag_view.js.map