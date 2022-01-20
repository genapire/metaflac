import { Metadata, VorbisComment } from "./types.ts";

export interface TagView {
  get title(): string | undefined;
  set title(value: string | undefined | null);
  get artist(): string | undefined;
  set artist(value: string | undefined | null);
  get album(): string | undefined;
  set album(value: string | undefined | null);
  get track(): number | undefined;
  set track(value: number | undefined | null);
  get date(): string | undefined;
  set date(value: string | undefined | null);
  get genre(): string | undefined;
  set genre(value: string | undefined | null);
}

export function createTagView(metadata: Metadata): TagView {
  metadata.vorbisComment ??= { vendor: "", comments: [] };
  const { vorbisComment } = metadata;

  return {
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
    set genre(value) {
      setOrRemoveComment(vorbisComment, "GENRE", value);
    },
  };
}

const standardFieldNames = [
  "TITLE",
  "VERSION",
  "ALBUM",
  "TRACKNUMBER",
  "ARTIST",
  "PERFORMER",
  "COPYRIGHT",
  "LICENSE",
  "ORGANIZATION",
  "DESCRIPTION",
  "GENRE",
  "DATE",
  "LOCATION",
  "CONTACT",
  "ISRC",
] as const;
type StandardFields = typeof standardFieldNames[number];

function queryCommentValue(
  vorbisComment: VorbisComment,
  field: StandardFields,
): string | undefined {
  return vorbisComment.comments
    .find((comment) => comment.field.toUpperCase() === field)
    ?.value;
}

function setOrRemoveComment(
  vorbisComment: VorbisComment,
  field: StandardFields,
  value: string | undefined | null,
) {
  if (value == null) {
    vorbisComment.comments = vorbisComment.comments
      .filter((comment) => comment.field.toUpperCase() !== field);
    return;
  }

  const comment = vorbisComment.comments
    .find((comment) => comment.field.toUpperCase() === field);
  if (comment) {
    comment.value = value;
    return;
  }

  vorbisComment.comments.push({ field, value });
}
