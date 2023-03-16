export const FLAG_IS_LAST_BLOCK = 0b10000000

export function assertFlacFile(file: Uint8Array) {
  if (
    file[0] === 102 /* "f" */ &&
    file[1] === 76 /* "L" */ &&
    file[2] === 97 /* "a" */ &&
    file[3] === 67 /* "C" */
  ) {
    return
  }
  throw new Error('Invalid FLAC file.')
}
