import {parsePictureMetadata} from './image.js'
import type {Metadata, Picture, PictureType, VorbisComment} from './types.js'

export interface TagView {
    get trackTotal(): string | undefined;

    get discNumber(): string | undefined;

    get discTotal(): string | undefined;

    get composer(): string | undefined;

    get lyrics(): string | undefined;

    get title(): string | undefined;

    set title(value: string | undefined | null);

    get artist(): string | undefined;

    set artist(value: string | undefined | null);

    get album(): string | undefined;

    set album(value: string | undefined | null);

    get albumArtist(): string | undefined;

    set albumArtist(value: string | undefined | null);

    get track(): number | undefined;

    set track(value: number | undefined | null);

    get date(): string | undefined;

    set date(value: string | undefined | null);

    get genre(): string | undefined;

    set genres(values: string[] | undefined | null);

    get version(): string | undefined;

    set version(value: string | undefined | null);

    get performer(): string | undefined;

    set performer(value: string | undefined | null);

    get copyright(): string | undefined;

    set copyright(value: string | undefined | null);

    get license(): string | undefined;

    set license(value: string | undefined | null);

    get organization(): string | undefined;

    set organization(value: string | undefined | null);

    get description(): string | undefined;

    set description(value: string | undefined | null);

    get location(): string | undefined;

    set location(value: string | undefined | null);

    get contact(): string | undefined;

    set contact(value: string | undefined | null);

    get isrc(): string | undefined;

    set isrc(value: string | undefined | null);

    findPicture(type: PictureType): Picture | undefined;

    attachPicture(
        options:
        & Pick<Picture, "type" | "picture">
            & Partial<Omit<Picture, "type" | "picture">>,
    ): void;

    removePicture(type: PictureType): void;

    removeAllPictures(): void;
}

export function createTagView(metadata: Metadata): TagView {
    metadata.vorbisComment ??= {vendor: "", comments: []};
    const {vorbisComment} = metadata;

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
            return (
                queryCommentValue(vorbisComment, "ALBUMARTIST") ??
                queryCommentValue(vorbisComment, "ALBUM ARTIST")
            );
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
        set genres(values: string[]) {
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
            let picture: Picture;
            if (
                !options.mime ||
                !options.width ||
                !options.height ||
                !options.colorDepth ||
                !options.usedColors
            ) {
                picture = {
                    ...parsePictureMetadata(options.picture),
                    ...options,
                    description: options.description ?? "",
                };
            } else {
                picture = {
                    ...(options as Omit<Picture, "description">),
                    description: options.description ?? "",
                };
            }

            const existing = metadata.pictures.find(
                ({type}) => type === options.type,
            );
            if (existing) {
                Object.assign(existing, picture);
            } else {
                metadata.pictures.push(picture);
            }
        },
        removePicture(type) {
            metadata.pictures = metadata.pictures.filter(
                (picture) => picture.type !== type,
            );
        },
        removeAllPictures() {
            metadata.pictures = [];
        },
    };
}

type StandardFields =
    | "TITLE"
    | "VERSION"
    | "ALBUM"
    | "TRACKNUMBER"
    | "ARTIST"
    | "PERFORMER"
    | "COPYRIGHT"
    | "LICENSE"
    | "ORGANIZATION"
    | "DESCRIPTION"
    | "GENRE"
    | "DATE"
    | "LOCATION"
    | "CONTACT"
    | "ISRC"
type ExtensionFields =
    "ALBUMARTIST"
    | "ALBUM ARTIST"
    | "TRACKTOTAL"
    | "DISCTOTAL"
    | "DISCNUMBER"
    | "COMPOSER"
    | "LYRICS"
type FieldNames = StandardFields | ExtensionFields

function queryCommentValue(
    vorbisComment: VorbisComment,
    field: FieldNames,
): string | undefined {
    return vorbisComment.comments.find(
        (comment) => comment.field.toUpperCase() === field,
    )?.value;
}

function setOrRemoveComment(
    vorbisComment: VorbisComment,
    field: FieldNames,
    value: string | undefined | null,
) {
    if (value == null) {
        vorbisComment.comments = vorbisComment.comments.filter(
            (comment) => comment.field.toUpperCase() !== field,
        );
        return;
    }

    const comment = vorbisComment.comments.find(
        (comment) => comment.field.toUpperCase() === field,
    );
    if (comment) {
        comment.value = value;
    } else {
        vorbisComment.comments.push({field: field.toLocaleLowerCase(), value});
    }
}

function setOrRemoveManyComment(
    vorbisComment: VorbisComment,
    field: FieldNames,
    values: string[] | undefined | null,
) {
    if (values == null) {
        vorbisComment.comments = vorbisComment.comments.filter(
            (comment) => comment.field.toUpperCase() !== field,
        );
        return;
    }

    const existingCommentValues = vorbisComment.comments.filter(
        (comment) => comment.field.toUpperCase() === field,
    ).map(c => c.value);

    values.filter(c => !existingCommentValues.includes(c)).forEach((value) => vorbisComment.comments.push({
        field: field.toLocaleLowerCase(),
        value
    }));
}
