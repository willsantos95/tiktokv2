import { Request, Response, NextFunction } from 'express';
import { oauthService } from '../../../modules/auth/services/oauth.service.js';
import { stateService } from '../../../modules/auth/services/state.service.js';
import { AppError } from '../../../shared/middleware/error-handler.js';
import { ErrorCode } from '../../../shared/constants/error-codes.js';
import { logger } from '../../../shared/utils/logger.js';
import { ApiResponse } from '../../../types/index.js';

export class OAuthController {
  async getAuthUrl(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const state = stateService.generateState();
      stateService.storeState(state);

      const authUrl = oauthService.generateAuthorizationUrl(state);

      logger.info('📤 Authorization URL sent to client');

      res.json({
        success: true,
        data: { authUrl, state },
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  async handleCallback(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const { code, state, error, error_description } = req.query;

      logger.info('🔄 OAuth callback received', {
        hasCode: !!code,
        hasState: !!state,
        error: error ? String(error) : undefined,
      });

      // Check for TikTok error
      if (error) {
        logger.warn('❌ OAuth error from TikTok', {
          error: String(error),
          description: String(error_description),
        });

        return res.redirect(
          `/login.html?error=${encodeURIComponent(String(error_description || error))}`,
        );
      }

      // Validate parameters
      if (!code || !state) {
        logger.error('❌ Missing OAuth parameters', {
          hasCode: !!code,
          hasState: !!state,
        });

        throw new AppError(
          ErrorCode.INVALID_REQUEST,
          400,
          { missingCode: !code, missingState: !state },
        );
      }

      // Validate state (CSRF protection)
      if (!stateService.validateState(String(state))) {
        throw new AppError(
          ErrorCode.INVALID_STATE,
          400,
        );
      }

      // Exchange code for token
      const tokenData = await oauthService.exchangeCodeForToken(String(code));

      // Fetch user info
      const userData = await oauthService.fetchUserInfo(tokenData.access_token);

      // Create session user
      const sessionUser = oauthService.createSessionUser(tokenData, userData);

      // Store in session
      req.session.user = sessionUser;

      logger.info('🎉 OAuth flow completed successfully', {
        displayName: userData.display_name,
      });

      // Save session and redirect
      req.session.save((err) => {
        if (err) {
          logger.error('Session save error', { error: err.message });
          return res.redirect('/login.html?error=session_save_failed');
        }

        res.redirect('/dashboard.html');
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      if (!req.session?.user) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED,
          401,
        );
      }

      // Check if token needs refresh
      if (oauthService.isTokenExpired(req.session.user.expiresAt)) {
        logger.info('🔄 Token expired, attempting refresh');

        try {
          const refreshedTokenData = await oauthService.refreshAccessToken(
            req.session.user.refreshToken,
          );

          req.session.user.accessToken = refreshedTokenData.access_token;
          req.session.user.refreshToken = refreshedTokenData.refresh_token;
          req.session.user.expiresAt = new Date(
            Date.now() + refreshedTokenData.expires_in * 1000,
          );

          req.session.save();
        } catch (refreshError) {
          logger.warn('Token refresh failed, user needs to re-login');
          throw new AppError(
            ErrorCode.TOKEN_EXPIRED,
            401,
          );
        }
      }

      res.json({
        success: true,
        data: { user: req.session.user },
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      req.session.destroy((err) => {
        if (err) {
          logger.error('Logout error', { error: err.message });
          throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            500,
          );
        }

        logger.info('👋 User logged out successfully');

        res.json({
          success: true,
          message: 'Logged out successfully',
          timestamp: new Date(),
        });
      });
    } catch (error) {
      next(error);
    }
  }
}

export const oauthController = new OAuthController();
