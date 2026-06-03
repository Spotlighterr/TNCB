import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tncb_secret_key_2026_secure');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống.'
      });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
    });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    // Admin user check via email as well (following frontend conventions)
    const isAdmin = req.user && (req.user.email === 'admin@tncb.vn' || req.user.role === 'admin');
    
    if (isAdmin) {
      return next(); // Admin bypassed check
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này.'
      });
    }
    next();
  };
};
