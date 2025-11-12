import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not defined in environment variables');
}

/**
 * Encrypts a string value using AES encryption
 */
export function encrypt(value: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt value');
  }
}

/**
 * Decrypts an encrypted string value
 */
export function decrypt(encryptedValue: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt value');
  }
}

