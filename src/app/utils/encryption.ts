import crypto from 'crypto';
import { promisify } from 'util';

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const keyLength = 32;
const scryptCost = 16384;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

const scryptAsync = promisify(crypto.scrypt);

export async function generateEncryptionKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, keyLength, { N: scryptCost })) as Buffer;
}

export async function encryptData(data: string, secretKey: string): Promise<EncryptedData> {
  const salt = crypto.randomBytes(saltLength);
  const iv = crypto.randomBytes(ivLength);
  const key = await generateEncryptionKey(secretKey, salt);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex')
  };
}

export async function decryptData(encryptedData: EncryptedData, secretKey: string): Promise<string> {
  const { encrypted, iv, tag, salt } = encryptedData;

  const key = await generateEncryptionKey(
    secretKey,
    Buffer.from(salt, 'hex')
  );

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}