import { TikTokConfig } from '../types/index.js';
export declare const config: {
    env: string;
    port: number;
    appUrl: string;
    corsOrigin: string | undefined;
    tiktok: TikTokConfig;
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    session: {
        secret: string;
        maxAge: number;
    };
    logging: {
        level: string;
    };
    upload: {
        maxSize: number;
        tempDir: string;
        publicDir: string;
    };
    api: {
        version: string;
        baseUrl: string;
    };
};
export declare function validateConfig(): void;
//# sourceMappingURL=index.d.ts.map