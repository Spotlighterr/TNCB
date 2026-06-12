import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendImportErrorReport = async (toEmail, sheetUrl, successCount, failedCount, errors) => {
  if (!toEmail) return;

  try {
    const transporter = createTransporter();

    let errorTableRows = '';
    errors.forEach(err => {
      errorTableRows += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace; font-weight: bold; color: #d32f2f;">Dòng ${err.row}</td>
          <td style="border: 1px solid #ddd; padding: 8px; color: #555;">${err.message}</td>
        </tr>
      `;
    });

    const mailOptions = {
      from: `"Hệ thống FindX" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[FindX] Báo cáo lỗi đồng bộ dữ liệu từ Google Sheet`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; padding: 15px 20px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">Phát hiện lỗi nhập dữ liệu</h2>
          </div>
          
          <div style="padding: 20px 10px;">
            <p>Xin chào Admin,</p>
            <p>Hệ thống vừa thực hiện đồng bộ dữ liệu phòng trọ từ Google Sheet của bạn.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Đường dẫn bảng tính:</strong> <a href="${sheetUrl}" target="_blank" style="color: #2563eb; text-decoration: none; word-break: break-all;">Xem file Google Sheet</a></p>
              <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
              <p style="margin: 5px 0;"><strong>Thành công:</strong> <span style="color: #16a34a; font-weight: bold;">${successCount} tin đăng</span></p>
              <p style="margin: 5px 0;"><strong>Bị lỗi (Bỏ qua):</strong> <span style="color: #dc2626; font-weight: bold;">${failedCount} dòng</span></p>
            </div>
            
            <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">Danh sách chi tiết các dòng bị lỗi:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 100px;">Hàng số</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Mô tả chi tiết lỗi</th>
                </tr>
              </thead>
              <tbody>
                ${errorTableRows}
              </tbody>
            </table>
            
            <p style="margin-top: 25px; color: #64748b; font-size: 13px; font-style: italic;">
              * Lưu ý: Các hàng bị lỗi trên đã bị hệ thống tự động bỏ qua để tránh hiển thị sai lệch thông tin trên trang chủ. Vui lòng mở Google Sheet và hiệu chỉnh lại theo báo cáo trên.
            </p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #eee; padding-top: 15px; color: #94a3b8; font-size: 11px; margin-top: 20px;">
            Hệ thống thông báo tự động FindX - Vui lòng không trả lời email này.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Gửi email báo lỗi đồng bộ thành công tới: ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Không thể gửi email báo lỗi đồng bộ:`, err.message);
    return false;
  }
};
