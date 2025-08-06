/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * encrypt/decrypt use for ping drm
 */
export class Secure {
  /**
   * Encrypt and decrypt data by XOR
   * @param {*} data
   * @param {*} key
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cryptoraphy(data: any, key: any) {
    data = new Uint8Array(data);
    const dataLength = data.byteLength;
    const result = new Uint8Array(dataLength);
    for (let i = 0; i < dataLength; i++) {
      result[i] = data[i] ^ key[i % key.byteLength];
    }
    return result;
  }

  /**
   * Convert string to hex
   * @param {*} str
   */
  str2hex(str: string) {
    let hex = '';
    try {
      hex = unescape(encodeURIComponent(str))
        .split('')
        .map(function (v) {
          return v.charCodeAt(0).toString(16);
        })
        .join('');
    } catch {
      hex = str;
    }
    return hex;
  }
  /**
   * Javascript
   * Encrypt message by id
   * @param msg data need encrypt
   * @param id key
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encrypt(msg: any, id: string) {
    const enc = new TextEncoder();
    const key = enc.encode(id);
    const typedArray = new Uint8Array(
      // @ts-ignore
      this.str2hex(JSON.stringify(msg))
        .match(/[\da-f]{2}/gi)
        .map(function (h) {
          return parseInt(h, 16);
        }),
    );
    return new Uint8Array(this.cryptoraphy(typedArray, key));
  }

  /**
   * Decrypt message by id
   * @param msg data need decrypt
   * @param id key
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decrypt(msg: any, id: string) {
    const enc = new TextEncoder();
    const dec = new TextDecoder('utf-8');
    const key = enc.encode(id);
    return dec.decode(this.cryptoraphy(msg, key));
  }
}
