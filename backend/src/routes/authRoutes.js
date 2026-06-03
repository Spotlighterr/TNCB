import express from 'express';
import {
  registerStep1,
  registerStep2,
  login,
  forgotPasswordStep1,
  forgotPasswordStep2,
  getMe,
  updateProfile,
  googleLogin,
  completeGoogleProfile
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register-step1', registerStep1);
router.post('/register-step2', registerStep2);
router.post('/login', login);
router.post('/forgot-password-step1', forgotPasswordStep1);
router.post('/forgot-password-step2', forgotPasswordStep2);
router.post('/google', googleLogin);
router.post('/google/complete', completeGoogleProfile);

// Private routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;
