import jwt from 'jsonwebtoken';
import User from './User.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// RAM storage for simulation OTPs
const otpCache = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

let transporter = null;

const getMailTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
    console.log('📬 Nodemailer SMTP Transporter configured successfully.');
  }
  return transporter;
};

export const sendOTPEmail = async (email, otp, subject = 'Xác thực OTP - FindX') => {
  const mailTransporter = getMailTransporter();
  const from = process.env.SMTP_FROM || 'FindX Support <noreply@findx.id.vn>';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4A90E2; text-align: center;">Xác thực tài khoản FindX</h2>
      <p>Xin chào,</p>
      <p>Bạn nhận được email này vì đã gửi yêu cầu xác thực tài khoản trên hệ thống Tìm kiếm phòng trọ FindX.</p>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
      </div>
      <p>Mã OTP này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Hệ thống Tìm kiếm Phòng trọ & Ở ghép FindX - TNCB</p>
    </div>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from,
        to: email,
        subject,
        html: htmlContent
      });
      console.log(`[Email] OTP sent to ${email} successfully.`);
      return true;
    } catch (err) {
      console.error(`[Email] Failed to send OTP to ${email}:`, err.message);
      return false;
    }
  } else {
    // Simulation / Demo Mode
    console.log('\n======================================');
    console.log(`[EMAIL SIMULATOR] Gửi OTP đến: ${email}`);
    console.log(`[EMAIL SIMULATOR] Chủ đề: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Mã OTP: ${otp}`);
    console.log('======================================\n');
    return true;
  }
};

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

    // Cache the OTP keyed by email
    otpCache.set(email, { otp, expiresAt });

    // Send Real or Simulated Email
    await sendOTPEmail(email, otp, 'Xác nhận Đăng ký Tài khoản - FindX');

    // Return the OTP in the response for simulation/demo
    return res.status(200).json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn.',
      email,
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

    // Verify OTP from cache using email
    const cached = otpCache.get(email);
    if (!cached) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu OTP cho email này.'
      });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(email);
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
    otpCache.delete(email);

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
      zalo: newUser.zalo,
      mfaEnabled: newUser.mfaEnabled,
      otpEnabled: newUser.otpEnabled
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

    // Check optional MFA (Priority 1)
    if (user.mfaEnabled && user.mfaSecret) {
      const tempMfaToken = jwt.sign(
        { tempUserId: user._id },
        process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
        { expiresIn: '5m' }
      );
      return res.status(200).json({
        success: true,
        requiresMfa: true,
        tempMfaToken
      });
    }

    // Check optional Email OTP (Priority 2)
    if (user.otpEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + OTP_EXPIRY_MS;

      otpCache.set(`login-${user.email}`, { otp, expiresAt });

      await sendOTPEmail(user.email, otp, 'Mã xác thực Đăng nhập - FindX');

      const tempOtpToken = jwt.sign(
        { tempUserId: user._id },
        process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        success: true,
        requiresOtp: true,
        tempOtpToken,
        email: user.email,
        otp
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
      zalo: user.zalo,
      mfaEnabled: user.mfaEnabled,
      otpEnabled: user.otpEnabled
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email này chưa được đăng ký trên hệ thống.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Cache the OTP keyed by email
    otpCache.set(`forgot-${email}`, { otp, expiresAt });

    // Send Email
    await sendOTPEmail(email, otp, 'Khôi phục Mật khẩu FindX');

    return res.status(200).json({
      success: true,
      message: 'Mã khôi phục mật khẩu đã được gửi đến email của bạn.',
      email,
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các trường thông tin.'
      });
    }

    const cached = otpCache.get(`forgot-${email}`);
    if (!cached) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu khôi phục cho email này.'
      });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(`forgot-${email}`);
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
    otpCache.delete(`forgot-${email}`);

    const user = await User.findOne({ email });
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
    zalo: user.zalo,
    mfaEnabled: user.mfaEnabled,
    otpEnabled: user.otpEnabled
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
      zalo: user.zalo,
      mfaEnabled: user.mfaEnabled,
      otpEnabled: user.otpEnabled
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

      // Check optional MFA
      if (user.mfaEnabled && user.mfaSecret) {
        const tempMfaToken = jwt.sign(
          { tempUserId: user._id },
          process.env.JWT_SECRET || 'tncb_secret_key_2026_secure',
          { expiresIn: '5m' }
        );
        return res.status(200).json({
          success: true,
          requiresMfa: true,
          tempMfaToken
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
          zalo: user.zalo,
          mfaEnabled: user.mfaEnabled,
          otpEnabled: user.otpEnabled
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
      zalo: user.zalo,
      mfaEnabled: user.mfaEnabled,
      otpEnabled: user.otpEnabled
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

export const setupMfa = async (req, res) => {
  try {
    const user = req.user;
    
    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate key URI
    const otpauth = authenticator.keyuri(user.email, 'FindX', secret);
    
    // Generate QR Code data URL
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    // Save secret to database (but mfaEnabled is false until verified)
    user.mfaSecret = secret;
    await user.save();
    
    return res.status(200).json({
      success: true,
      secret,
      qrCodeUrl
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi thiết lập MFA: ' + err.message
    });
  }
};

export const verifyMfa = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực 6 số.'
      });
    }
    
    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'Chưa khởi tạo thiết lập MFA. Vui lòng thiết lập lại.'
      });
    }
    
    const isValid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không chính xác.'
      });
    }
    
    user.mfaEnabled = true;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Kích hoạt Xác thực 2 lớp (MFA) thành công.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        zalo: user.zalo,
        mfaEnabled: user.mfaEnabled,
        otpEnabled: user.otpEnabled
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác minh MFA: ' + err.message
    });
  }
};

export const disableMfa = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực 6 số để xác nhận tắt MFA.'
      });
    }
    
    const isValid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không chính xác. Không thể tắt MFA.'
      });
    }
    
    user.mfaEnabled = false;
    user.mfaSecret = null;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Đã tắt Xác thực 2 lớp (MFA) thành công.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        zalo: user.zalo,
        mfaEnabled: user.mfaEnabled,
        otpEnabled: user.otpEnabled
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tắt MFA: ' + err.message
    });
  }
};

export const loginVerifyMfa = async (req, res) => {
  try {
    const { tempMfaToken, code } = req.body;
    
    if (!tempMfaToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực và token tạm thời.'
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(tempMfaToken, process.env.JWT_SECRET || 'tncb_secret_key_2026_secure');
    } catch (jwtErr) {
      return res.status(400).json({
        success: false,
        message: 'Mã đăng nhập tạm thời đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }
    
    const { tempUserId } = decoded;
    const user = await User.findById(tempUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản.'
      });
    }
    
    const isValid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không chính xác.'
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
      zalo: user.zalo,
      mfaEnabled: user.mfaEnabled,
      otpEnabled: user.otpEnabled
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
      message: 'Lỗi xác minh đăng nhập MFA: ' + err.message
    });
  }
};

export const loginVerifyOtp = async (req, res) => {
  try {
    const { tempOtpToken, code } = req.body;
    
    if (!tempOtpToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực và token tạm thời.'
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(tempOtpToken, process.env.JWT_SECRET || 'tncb_secret_key_2026_secure');
    } catch (jwtErr) {
      return res.status(400).json({
        success: false,
        message: 'Mã đăng nhập tạm thời đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }
    
    const { tempUserId } = decoded;
    const user = await User.findById(tempUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản.'
      });
    }
    
    const cached = otpCache.get(`login-${user.email}`);
    if (!cached) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu xác thực OTP cho email này.'
      });
    }
    
    if (Date.now() > cached.expiresAt) {
      otpCache.delete(`login-${user.email}`);
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng gửi lại.'
      });
    }
    
    if (cached.otp !== code) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác.'
      });
    }
    
    otpCache.delete(`login-${user.email}`);
    
    const token = generateToken(user._id);
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      zalo: user.zalo,
      mfaEnabled: user.mfaEnabled,
      otpEnabled: user.otpEnabled
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
      message: 'Lỗi xác minh đăng nhập OTP: ' + err.message
    });
  }
};

export const toggleOtp = async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = req.user;
    
    user.otpEnabled = !!enabled;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `Đã ${user.otpEnabled ? 'bật' : 'tắt'} xác thực OTP qua email thành công.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        zalo: user.zalo,
        mfaEnabled: user.mfaEnabled,
        otpEnabled: user.otpEnabled
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cấu hình OTP: ' + err.message
    });
  }
};
