import {JSEncrypt} from "jsencrypt";
import CryptoJS from "crypto-js";
import {getHashFromObj} from "./cryptoUtils.js";

export async function verifyObj(obj, signature, publicKey) {
    try {
        let hash = await getHashFromObj(obj);

        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);

        let verified = encrypt.verify(hash, signature, CryptoJS.SHA256);
        return verified;
    } catch (e) {
        console.log(" > Error in verifyObj: ", e);
        return false;
    }
}