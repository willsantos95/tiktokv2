import { VideoMetadata, SessionUser } from '../../../types/index.js';
export declare class VideoService {
    validateVideoFile(file: Express.Multer.File): void;
    validateMetadata(metadata: VideoMetadata): void;
    initializeUpload(user: SessionUser, fileSize: number): Promise<string>;
    uploadVideoChunk(user: SessionUser, uploadToken: string, videoBuffer: Buffer, partNumber?: number): Promise<void>;
    finalizeUpload(user: SessionUser, uploadToken: string, metadata: VideoMetadata, publishType: 'DRAFT' | 'PUBLISH_IMMEDIATELY'): Promise<string>;
    cleanupTempFile(filePath: string): void;
}
export declare const videoService: VideoService;
//# sourceMappingURL=video.service.d.ts.map