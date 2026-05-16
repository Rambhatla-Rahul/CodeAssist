import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileService } from './file.service';

@ApiTags('files')
@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate a secure file upload' })
  @ApiQuery({ name: 'filename', type: String, required: true })
  @ApiQuery({ name: 'mimetype', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed upload URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
        uploadUrl: { type: 'string' },
        downloadUrl: { type: 'string' },
      },
    },
  })
  async initiateUpload(
    @Query('filename') filename: string,
    @Query('mimetype') mimetype: string,
  ) {
    this.logger.log(`Initiating upload for file: ${filename}`);
    return this.fileService.initiateSecureUpload(filename, mimetype);
  }

  @Get(':fileId/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a pre-signed download URL for a file' })
  @ApiParam({ name: 'fileId', type: String })
  @ApiQuery({ name: 'filename', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
      },
    },
  })
  async getDownloadUrl(
    @Param('fileId') fileId: string,
    @Query('filename') filename: string,
  ) {
    this.logger.log(`Generating download URL for file ID: ${fileId}`);
    const downloadUrl = await this.fileService.getFileDownloadUrl(fileId, filename);
    return { downloadUrl };
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'fileId', type: String })
  @ApiQuery({ name: 'filename', type: String, required: true })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  async deleteFile(
    @Param('fileId') fileId: string,
    @Query('filename') filename: string,
  ) {
    this.logger.log(`Deleting file with ID: ${fileId}`);
    await this.fileService.deleteFile(fileId, filename);
  }
}
