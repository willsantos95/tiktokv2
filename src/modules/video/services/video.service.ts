import axios from 'axios';
import fs from 'fs';
import { config } from '../../../config/index.js';
import { logger } from '../../../shared/utils/logger.js';
import { AppError } from '../../../shared/middleware/error-handler.js';
import { ErrorCode, VALID_VIDEO_FORMATS, MAX_VIDEO_SIZE, MAX_CAPTION_LENGTH } from '../../../shared/constants/error-codes.js';
import { VideoMetadata, TikTokVideoInit, TikTokVideoFinish, SessionUser } from '../../../types/index.js';

export class VideoService {
  validateVideoFile(file: Express.Multer.File): void {
    if (!file) {
      throw new AppError(
        ErrorCode.INVALID_REQUEST,
        400,
        { message: 'No video file provided' },
      );
    }

    // Validate file type
    if (!VALID_VIDEO_FORMATS.includes(file.mimetype)) {
      logger.warn('❌ Invalid video format', {
        format: file.mimetype,
      });

      throw new AppError(
        ErrorCode.INVALID_FILE_FORMAT,
        400,
        { allowedFormats: VALID_VIDEO_FORMATS },
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      logger.warn('❌ Video file too large', {
        size: file.size,
        maxSize: MAX_VIDEO_SIZE,
      });

      throw new AppError(
        ErrorCode.FILE_TOO_LARGE,
        413,
        { maxSize: MAX_VIDEO_SIZE },
      );
    }
  }

  validateMetadata(metadata: VideoMetadata): void {
    if (!metadata) {
      throw new AppError(
        ErrorCode.INVALID_METADATA,
        400,
      );
    }

    if (metadata.title && metadata.title.length > MAX_CAPTION_LENGTH) {
      throw new AppError(
        ErrorCode.INVALID_METADATA,
        400,
        { message: `Caption exceeds maximum length of ${MAX_CAPTION_LENGTH}` },
      );
    }

    const validPrivacyLevels = ['PUBLIC', 'FRIENDS', 'SELF_ONLY'];
    if (!validPrivacyLevels.includes(metadata.privacyLevel)) {
      throw new AppError(
        ErrorCode.INVALID_METADATA,
        400,
        { validPrivacyLevels },
      );
    }
  }

  async initializeUpload(
    user: SessionUser,
    fileSize: number,
  ): Promise<string> {
    try {
      logger.info('📤 Initializing video upload', {
        fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      });

      const response = await axios.post<TikTokVideoInit>(
        `${config.tiktok.apiBaseUrl}/v2/post/publish/video/init/`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            chunk_size: fileSize,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          timeout: 10000,
        },
      );

      const uploadToken = response.data.data.upload_token;

      logger.info('✅ Upload token received', {
        tokenLength: uploadToken.length,
      });

      return uploadToken;
    } catch (error) {
      logger.error('❌ Failed to initialize upload', {
        error: error instanceof Error ? error.message : String(error),
      });

      if (axios.isAxiosError(error)) {
        throw new AppError(
          ErrorCode.TIKTOK_API_ERROR,
          500,
          error.response?.data,
        );
      }

      throw error;
    }
  }

  async uploadVideoChunk(
    user: SessionUser,
    uploadToken: string,
    videoBuffer: Buffer,
    partNumber: number = 1,
  ): Promise<void> {
    try {
      logger.info('📤 Uploading video chunk', {
        size: `${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB`,
        partNumber,
      });

      await axios.post(
        `${config.tiktok.apiBaseUrl}/v2/post/publish/video/upload/`,
        videoBuffer,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'video/mp4',
          },
          params: {
            upload_token: uploadToken,
            part_number: partNumber,
          },
          timeout: 60000, // 60 seconds for large files
        },
      );

      logger.info('✅ Video chunk uploaded successfully');
    } catch (error) {
      logger.error('❌ Failed to upload video chunk', {
        error: error instanceof Error ? error.message : String(error),
      });

      if (axios.isAxiosError(error)) {
        throw new AppError(
          ErrorCode.UPLOAD_FAILED,
          500,
          error.response?.data,
        );
      }

      throw error;
    }
  }

  async finalizeUpload(
    user: SessionUser,
    uploadToken: string,
    metadata: VideoMetadata,
    publishType: 'DRAFT' | 'PUBLISH_IMMEDIATELY',
  ): Promise<string> {
    try {
      logger.info('🎬 Finalizing video upload', {
        publishType,
        title: metadata.title?.substring(0, 50),
      });

      const postInfo = {
        title: metadata.title || 'Video',
        privacy_level: metadata.privacyLevel,
        disable_duet: metadata.disableDuet,
        disable_comment: metadata.disableComment,
        disable_stitch: metadata.disableStitch,
        video_cover_timestamp_ms: metadata.videoCoverTimestampMs || 1000,
      };

      const response = await axios.post<TikTokVideoFinish>(
        `${config.tiktok.apiBaseUrl}/v2/post/publish/video/finish/`,
        {
          upload_token: uploadToken,
          publish_type: publishType,
          post_info: postInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          timeout: 10000,
        },
      );

      const videoId = response.data.data.video_id;

      logger.info(`🎉 Video ${publishType === 'DRAFT' ? 'uploaded as draft' : 'published'} successfully`, {
        videoId,
      });

      return videoId;
    } catch (error) {
      logger.error('❌ Failed to finalize upload', {
        error: error instanceof Error ? error.message : String(error),
      });

      if (axios.isAxiosError(error)) {
        throw new AppError(
          ErrorCode.UPLOAD_FAILED,
          500,
          error.response?.data,
        );
      }

      throw error;
    }
  }

  cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug('🗑️  Temporary file cleaned up');
      }
    } catch (error) {
      logger.warn('Failed to cleanup temporary file', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const videoService = new VideoService();
