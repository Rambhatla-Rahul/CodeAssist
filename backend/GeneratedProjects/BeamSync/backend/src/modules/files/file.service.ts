import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Provider } from './s3.provider';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly s3Provider: S3Provider) {}

  async initiateSecureUpload(originalName: string, mimeType: string): Promise<{
    fileId: string;
    uploadUrl: string;
    downloadUrl: string;
  }> {
    try {
      const fileId = uuidv4();
      const fileKey = `${fileId}/${originalName}`;
      
      // Generate pre-signed URL for direct client upload
      const uploadUrl = await this.s3Provider.generateUploadUrl(fileKey);
      
      // Generate pre-signed URL for future download
      const downloadUrl = await this.s3Provider.generateDownloadUrl(fileKey);
      
      this.logger.log(`Initiated secure upload for file: ${originalName} with ID: ${fileId}`);
      
      return {
        fileId,
        uploadUrl,
        downloadUrl,
      };
    } catch (error) {
      this.logger.error('Failed to initiate secure upload', error.stack);
      throw error;
    }
  }

  async confirmUpload(fileId: string, originalName: string): Promise<void> {
    try {
      // In a real implementation, you might want to verify the file exists
      // and update database records here
      this.logger.log(`Confirmed upload for file ID: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to confirm upload for file ID: ${fileId}`, error.stack);
      throw error;
    }
  }

  async getFileDownloadUrl(fileId: string, originalName: string): Promise<string> {
    try {
      const fileKey = `${fileId}/${originalName}`;
      const url = await this.s3Provider.generateDownloadUrl(fileKey);
      
      this.logger.log(`Generated download URL for file ID: ${fileId}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for file ID: ${fileId}`, error.stack);
      throw error;
    }
  }

  async deleteFile(fileId: string, originalName: string): Promise<void> {
    try {
      const fileKey = `${fileId}/${originalName}`;
      await this.s3Provider.deleteFile(fileKey);
      
      this.logger.log(`Deleted file with ID: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file with ID: ${fileId}`, error.stack);
      throw error;
    }
  }
}
