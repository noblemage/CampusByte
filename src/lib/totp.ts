import CryptoJS from 'crypto-js';

/**
 * Generates a TOTP code using HMAC-SHA1.
 * @param secretHex The secret key as a hex string.
 * @param step The time step in seconds (default 30).
 * @param time The specific time to generate the code for (default is current time).
 * @returns A 6-digit TOTP string.
 */
export function generateTOTP(secretHex: string, step: number = 30, time?: number): string {
    const epoch = Math.floor((time || Date.now()) / 1000);
    const counter = Math.floor(epoch / step);
    
    // Convert counter to 8-byte hex buffer
    const timeHex = counter.toString(16).padStart(16, '0');
    const timeWord = CryptoJS.enc.Hex.parse(timeHex);
    const secretWord = CryptoJS.enc.Hex.parse(secretHex);
    
    const hash = CryptoJS.HmacSHA1(timeWord, secretWord);
    const hmacHex = hash.toString(CryptoJS.enc.Hex);
    
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const otp = (parseInt(hmacHex.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff) + '';
    
    return otp.substring(otp.length - 6).padStart(6, '0');
}

/**
 * Verifies a TOTP code.
 * @param token The code to verify.
 * @param secretHex The secret key as a hex string.
 * @param step The time step in seconds (default 30).
 * @param window Array [past, future] windows to check (e.g. [1, 0]).
 * @returns True if valid, false otherwise.
 */
export function verifyTOTP(token: string, secretHex: string, step: number = 30, window: [number, number] = [1, 0]): boolean {
    const now = Date.now();
    const pastWindows = window[0];
    const futureWindows = window[1];

    for (let i = -pastWindows; i <= futureWindows; i++) {
        const timeToVerify = now + (i * step * 1000);
        const generated = generateTOTP(secretHex, step, timeToVerify);
        if (generated === token) {
            return true;
        }
    }
    return false;
}
