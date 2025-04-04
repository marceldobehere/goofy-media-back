import LZ from 'lz-string';

export async function compress(str) {
    // console.log("compressing: ", str);

    // compress into base64
    let compressed = LZ.compressToBase64(str);
    return compressed;
}

export async function decompress(b64) {
    // console.log("decompressing: ", b64);

    // decompress from base64
    let decompressed = LZ.decompressFromBase64(b64);
    return decompressed;
}
