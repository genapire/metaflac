import type { Metadata } from './types.js';
export interface DumperOptions {
    /** Add specific size of padding after all metadata blocks. */
    trailingPadding?: number;
}
export declare function dump(metadata: Metadata, file: Uint8Array, options?: DumperOptions): Uint8Array;
