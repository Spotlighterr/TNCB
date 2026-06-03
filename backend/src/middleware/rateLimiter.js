import rateLimit from 'express-rate-limit';

// Hạn chế chung cho toàn bộ các API (Ngăn chặn spam request)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests từ mỗi IP trong 15 phút
  message: {
    success: false,
    message: 'Bạn đã thực hiện quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Trả về thông tin hạn mức trong headers RateLimit-*
  legacyHeaders: false, // Tắt các headers X-RateLimit-* cũ
});

// Hạn chế nghiêm ngặt cho các API Xác thực (Đăng nhập, Đăng ký, OTP để tránh Brute Force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 yêu cầu xác thực từ mỗi IP trong 15 phút
  message: {
    success: false,
    message: 'Phát hiện quá nhiều nỗ lực xác thực từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
