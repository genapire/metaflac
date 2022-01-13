export function isFlacFile(file: Uint8Array): boolean {
  return file[0] === 102 && // "f"
    file[1] === 76 && // "L"
    file[2] === 97 && // "a"
    file[3] === 67; // "C"
}
