import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const data = await authService.register(email, password, role);
      sendCreated(res, data, 'Account created successfully');
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      sendSuccess(res, data, 'Logged in successfully');
    } catch (err) { next(err); }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.me(req.user!.userId);
      sendSuccess(res, data, 'Current user');
    } catch (err) { next(err); }
  },
};
