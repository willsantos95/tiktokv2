import fs from 'fs';
import { videoService } from '../../../modules/video/services/video.service.js';
import { oauthService } from '../../../modules/auth/services/oauth.service.js';
import { logger } from '../../../shared/utils/logger.js';
import { AppError } from '../../../shared/middleware/error-handler.js';
import { ErrorCode } from '../../../shared/constants/error-codes.js';
export class VideoController {
    async uploadDraft(req, res, next) {
        let tempFilePath = null;
        try {
            if (!req.user) {
                throw new AppError(ErrorCode.UNAUTHORIZED, 401);
            }
            const { title, privacyLevel, disableDuet, disableComment, disableStitch } = req.body;
            const videoFile = req.file;
            // Validate video file
            videoService.validateVideoFile(videoFile);
            tempFilePath = videoFile.path;
            // Validate metadata
            const metadata = {
                title: title || 'Video',
                privacyLevel: privacyLevel || 'SELF_ONLY',
                disableDuet: disableDuet === 'true' || disableDuet === true,
                disableComment: disableComment === 'true' || disableComment === true,
                disableStitch: disableStitch === 'true' || disableStitch === true,
            };
            videoService.validateMetadata(metadata);
            logger.info('📤 Upload Draft Started', {
                title: metadata.title.substring(0, 50),
                privacy: metadata.privacyLevel,
            });
            // Check token expiration and refresh if needed
            if (oauthService.isTokenExpired(req.user.expiresAt)) {
                logger.info('🔄 Token expired, refreshing before upload');
                const refreshedTokenData = await oauthService.refreshAccessToken(req.user.refreshToken);
                req.user.accessToken = refreshedTokenData.access_token;
                req.user.refreshToken = refreshedTokenData.refresh_token;
                req.user.expiresAt = new Date(Date.now() + refreshedTokenData.expires_in * 1000);
                if (req.session) {
                    req.session.user = req.user;
                    req.session.save();
                }
            }
            // Initialize upload
            const fileSize = fs.statSync(tempFilePath).size;
            const uploadToken = await videoService.initializeUpload(req.user, fileSize);
            // Upload video
            const videoBuffer = fs.readFileSync(tempFilePath);
            await videoService.uploadVideoChunk(req.user, uploadToken, videoBuffer);
            // Finalize upload as draft
            const videoId = await videoService.finalizeUpload(req.user, uploadToken, metadata, 'DRAFT');
            logger.info('✅ Draft upload completed successfully', { videoId });
            res.json({
                success: true,
                message: 'Video uploaded as draft',
                data: { videoId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger.error('❌ Draft upload failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            if (tempFilePath) {
                videoService.cleanupTempFile(tempFilePath);
            }
            next(error);
        }
    }
    async publishVideo(req, res, next) {
        let tempFilePath = null;
        try {
            if (!req.user) {
                throw new AppError(ErrorCode.UNAUTHORIZED, 401);
            }
            const { title, hashtags, privacyLevel, disableDuet, disableComment, disableStitch } = req.body;
            const videoFile = req.file;
            // Validate video file
            videoService.validateVideoFile(videoFile);
            tempFilePath = videoFile.path;
            // Validate metadata
            const description = (title || '') + (hashtags ? ' ' + hashtags : '');
            const metadata = {
                title: description,
                privacyLevel: privacyLevel || 'SELF_ONLY',
                disableDuet: disableDuet === 'true' || disableDuet === true,
                disableComment: disableComment === 'true' || disableComment === true,
                disableStitch: disableStitch === 'true' || disableStitch === true,
            };
            videoService.validateMetadata(metadata);
            logger.info('🚀 Publish Started', {
                title: metadata.title.substring(0, 50),
                privacy: metadata.privacyLevel,
            });
            // Check token expiration and refresh if needed
            if (oauthService.isTokenExpired(req.user.expiresAt)) {
                logger.info('🔄 Token expired, refreshing before publish');
                const refreshedTokenData = await oauthService.refreshAccessToken(req.user.refreshToken);
                req.user.accessToken = refreshedTokenData.access_token;
                req.user.refreshToken = refreshedTokenData.refresh_token;
                req.user.expiresAt = new Date(Date.now() + refreshedTokenData.expires_in * 1000);
                if (req.session) {
                    req.session.user = req.user;
                    req.session.save();
                }
            }
            // Initialize upload
            const fileSize = fs.statSync(tempFilePath).size;
            const uploadToken = await videoService.initializeUpload(req.user, fileSize);
            // Upload video
            const videoBuffer = fs.readFileSync(tempFilePath);
            await videoService.uploadVideoChunk(req.user, uploadToken, videoBuffer);
            // Finalize and publish
            const videoId = await videoService.finalizeUpload(req.user, uploadToken, metadata, 'PUBLISH_IMMEDIATELY');
            logger.info('✅ Video published successfully', { videoId });
            res.json({
                success: true,
                message: 'Video published successfully',
                data: { videoId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger.error('❌ Publish failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            if (tempFilePath) {
                videoService.cleanupTempFile(tempFilePath);
            }
            next(error);
        }
    }
}
export const videoController = new VideoController();
//# sourceMappingURL=video.controller.js.map