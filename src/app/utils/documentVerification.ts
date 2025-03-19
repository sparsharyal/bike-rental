import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface VerificationDocument {
  userId: string;
  documentType: 'ID' | 'LICENSE' | 'PASSPORT';
  documentNumber: string;
  expiryDate: Date;
  issuingAuthority: string;
  documentImage: string; // Base64 encoded
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface DamageReport {
  rentalId: string;
  description: string;
  photos: string[]; // Array of Base64 encoded images
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export class DocumentVerification {
  private static readonly ALLOWED_DOCUMENT_TYPES = ['ID', 'LICENSE', 'PASSPORT'];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
  private static readonly ENCRYPTION_KEY = process.env.DOCUMENT_ENCRYPTION_KEY;

  static async verifyDocument(document: VerificationDocument): Promise<boolean> {
    try {
      // Validate document type
      if (!this.ALLOWED_DOCUMENT_TYPES.includes(document.documentType)) {
        throw new Error('Invalid document type');
      }

      // Validate expiry date
      if (new Date(document.expiryDate) < new Date()) {
        throw new Error('Document has expired');
      }

      // Validate and process document image
      const processedImage = await this.processDocumentImage(document.documentImage);
      const encryptedImage = this.encryptData(processedImage);

      // Store document information
      await prisma.verificationDocument.create({
        data: {
          userId: document.userId,
          documentType: document.documentType,
          documentNumber: this.encryptData(document.documentNumber),
          expiryDate: document.expiryDate,
          issuingAuthority: document.issuingAuthority,
          documentImage: encryptedImage,
          verificationStatus: 'PENDING'
        }
      });

      return true;
    } catch (error) {
      console.error('Document verification error:', error);
      return false;
    }
  }

  static async submitDamageReport(report: DamageReport): Promise<boolean> {
    try {
      // Process and validate each photo
      const processedPhotos = await Promise.all(
        report.photos.map(photo => this.processDocumentImage(photo))
      );

      // Encrypt photos
      const encryptedPhotos = processedPhotos.map(photo => this.encryptData(photo));

      // Store damage report
      await prisma.damageReport.create({
        data: {
          rentalId: report.rentalId,
          description: report.description,
          photos: encryptedPhotos,
          timestamp: report.timestamp,
          latitude: report.location.latitude,
          longitude: report.location.longitude
        }
      });

      return true;
    } catch (error) {
      console.error('Damage report submission error:', error);
      return false;
    }
  }

  private static async processDocumentImage(base64Image: string): Promise<string> {
    // Validate image size
    const buffer = Buffer.from(base64Image, 'base64');
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum limit');
    }

    // Validate image type
    const fileType = await import('file-type');
    const type = await fileType.fileTypeFromBuffer(buffer);
    if (!type || !this.ALLOWED_IMAGE_TYPES.includes(type.mime)) {
      throw new Error('Invalid image type');
    }

    // Process image - compress and resize
    const sharp = await import('sharp');
    const imageBuffer = buffer;
    
    const processedBuffer = await sharp.default(imageBuffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // Convert back to base64
    return processedBuffer.toString('base64');
  }

  private static encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.ENCRYPTION_KEY!, 'hex'),
      iv
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private static decryptData(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.ENCRYPTION_KEY!, 'hex'),
      iv
    );

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}