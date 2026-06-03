import jwt from 'jsonwebtoken';
import User from './User.js';
import { OAuth2Client } from 'google-auth-library';

// RAM storage for simulation OTPs
const otpCache = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Generate JWT Helper
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const registerStep1 = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (!email || !phone || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: email, số điện thoại và họ tên.'
      });
    }

    // Check if email or phone already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng trên hệ thống.'
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này đã được đăng ký.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Cache the OTP keyed by phone
    otpCache.set(phone, { otp, expiresAt });

    // Return the OTP in the response for simulation/demo
    return res.status(200).json({
      success: true,
      message: 'Mã OTP đã được gửi (Mô phỏng).',
      phone,
      otp // Return OTP directly so client can auto-read/display it in sandbox
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống: ' + err.message
    });
  }
};

export const registerStep2 = async (req, res) => {
  try {
    const { name, email, phone, password, role, otp } = req.body;

    if (!email || !phone || !name || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các trường thông tin.'
      });
    }

    // Verify OTP from cache
    const cached = otpCache.get(phone);
    if (!cached) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu OTP cho số điện thoại này.'
      });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng gửi lại.'
      });
    }

    if (cached.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác.'
      });
    }

    // OTP Verified, remove from cache
    otpCache.delete(phone);

    // Double check email/phone duplication to prevent race conditions
    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng.'
      });
    }

    const duplicatePhone = await User.findOne({ phone });
    if (duplicatePhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này đã được đăng ký.'
      });
    }

    // Create User
    const newUser = new User({
      name,
      email,
      phone,
      password,
      role: role || 'tenant'
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    // Exclude password from response
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      avatar: newUser.avatar,
      zalo: newUser.zalo
    };

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      token,
      user: userResponse
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký tài khoản: ' + err.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      zalo: user.zalo
    };

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      token,
      user: userResponse
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập: ' + err.message
    });
  }
};

export const forgotPasswordStep1 = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số điện thoại.'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này chưa được đăng ký trên hệ thống.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Cache the OTP keyed by phone
    otpCache.set(`forgot-${phone}`, { otp, expiresAt });

    return res.status(200).json({
      success: true,
      message: 'Mã khôi phục mật khẩu đã được tạo (Mô phỏng).',
      phone,
      otp // Return directly for simulator sandbox
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khôi phục mật khẩu: ' + err.message
    });
  }
};

export const forgotPasswordStep2 = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các trường thông tin.'
      });
    }

    const cached = otpCache.get(`forgot-${phone}`);
    if (!cached) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu khôi phục cho số điện thoại này.'
      });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(`forgot-${phone}`);
      return res.status(400).json({
        success: false,
        message: 'Mã OTP khôi phục đã hết hạn. Vui lòng gửi lại.'
      });
    }

    if (cached.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác.'
      });
    }

    // OTP Correct
    otpCache.delete(`forgot-${phone}`);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng không tồn tại.'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Khôi phục mật khẩu mới thành công. Hãy đăng nhập.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi đặt lại mật khẩu: ' + err.message
    });
  }
};

export const getMe = async (req, res) => {
  const user = req.user;
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    zalo: user.zalo
  };
  return res.status(200).json({
    success: true,
    user: userResponse
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, zalo, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) {
      // Check phone uniqueness if modified
      if (phone !== user.phone) {
        const exist = await User.findOne({ phone });
        if (exist) {
          return res.status(400).json({
            success: false,
            message: 'Số điện thoại này đã được sử dụng bởi người khác.'
          });
        }
        user.phone = phone;
      }
    }
    if (zalo) user.zalo = zalo;
    if (avatar) user.avatar = avatar;

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      zalo: user.zalo
    };

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công.',
      user: userResponse
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin: ' + err.message
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Google idToken.' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    let payload;
    try {
      if (idToken.startsWith('mock_token_')) {
        const mockEmail = idToken.replace('mock_token_', '') + '@gmail.com';
        payload = {
          email: mockEmail,
          name: 'Mock User ' + idToken.replace('mock_token_', ''),
          picture: `https://picsum.photos/seed/${idToken}/100/100`,
          sub: 'mock_sub_' + idToken
        };
      } else {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: clientId,
        });
        payload = ticket.getPayload();
      }
    } catch (verifyErr) {
      console.error('Google ID Token verification failed:', verifyErr.message);
      return res.status(400).json({ success: false, message: 'Google authentication failed: ' + verifyErr.message });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find user by email
    let user = await User.findOne({ email });

    if (user) {
      let updated = false;
      if (user.ssoProvider !== 'google') {
        user.ssoProvider = 'google';
        user.ssoId = googleId;
        updated = true;
      }
      if (!user.avatar) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }

      // Check if profile is complete (needs phone and role)
      if (!user.phone || !user.role) {
        const tempToken = jwt.sign(
          { tempUserId: user._id },
          process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
          { expiresIn: '15m' }
        );
        return res.status(200).json({
          success: true,
          needsCompletion: true,
          tempToken,
          user: {
            email: user.email,
            name: user.name,
            avatar: user.avatar
          }
        });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          zalo: user.zalo
        }
      });

    } else {
      user = new User({
        name,
        email,
        avatar: picture,
        ssoProvider: 'google',
        ssoId: googleId,
      });

      await user.save();

      const tempToken = jwt.sign(
        { tempUserId: user._id },
        process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        success: true,
        needsCompletion: true,
        tempToken,
        user: {
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống đăng nhập Google: ' + err.message });
  }
};

export const completeGoogleProfile = async (req, res) => {
  try {
    const { phone, role, tempToken } = req.body;

    if (!phone || !role || !tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: số điện thoại, vai trò và mã xác thực tạm thời.'
      });
    }

    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ.'
      });
    }

    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập SĐT Việt Nam.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'tncb_secret_key_2026_secure');
    } catch (jwtErr) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực tạm thời đã hết hạn hoặc không hợp lệ. Vui lòng thử đăng nhập Google lại.'
      });
    }

    const { tempUserId } = decoded;
    if (!tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không đúng định dạng.'
      });
    }

    const user = await User.findById(tempUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản tạm thời.'
      });
    }

    const existingPhone = await User.findOne({ phone, _id: { $ne: tempUserId } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.'
      });
    }

    user.phone = phone;
    user.role = role;
    if (!user.zalo) {
      user.zalo = phone;
    }
    await user.save();

    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      zalo: user.zalo
    };

    return res.status(200).json({
      success: true,
      message: 'Hoàn tất đăng ký tài khoản thành công.',
      token,
      user: userResponse
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi hoàn tất hồ sơ Google: ' + err.message
    });
  }
};
