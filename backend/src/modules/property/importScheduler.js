import SystemSettings from './SystemSettings.js';
import { syncPropertiesFromSheet } from './propertyController.js';

let syncIntervalId = null;

export const syncOnStartup = async () => {
  try {
    console.log('[Scheduler] Chạy đồng bộ nạp dữ liệu vào RAM lần đầu khi khởi động...');
    const res = await syncPropertiesFromSheet('startup');
    if (res.success) {
      console.log(`[Scheduler] Nạp dữ liệu khởi động thành công: Đã tải ${res.importedCount} phòng trọ.`);
    } else {
      console.error(`[Scheduler] Nạp dữ liệu khởi động thất bại:`, res.message);
    }
  } catch (err) {
    console.error(`[Scheduler Error] Lỗi khi nạp dữ liệu khởi động:`, err.message);
  }
};

export const updateSchedulerInterval = async () => {
  try {
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
      console.log('[Scheduler] Đã dừng tác vụ đồng bộ tự động cũ.');
    }

    const settingsDoc = await SystemSettings.findOne({ key: 'import_settings' });
    if (!settingsDoc || !settingsDoc.value || !settingsDoc.value.autoImportEnabled) {
      console.log('[Scheduler] Tác vụ đồng bộ tự động đang tắt.');
      return;
    }

    const { intervalHours, sheetUrl } = settingsDoc.value;
    if (!sheetUrl) {
      console.log('[Scheduler] Chưa cấu hình Google Sheet URL, bỏ qua lập lịch.');
      return;
    }

    const intervalMs = (intervalHours || 24) * 60 * 60 * 1000;
    console.log(`[Scheduler] Đã thiết lập tác vụ đồng bộ tự động. Chu kỳ: ${intervalHours} giờ.`);

    syncIntervalId = setInterval(async () => {
      console.log('[Scheduler] Bắt đầu chạy tác vụ đồng bộ tự động định kỳ...');
      const res = await syncPropertiesFromSheet('auto');
      if (res.success) {
        console.log(`[Scheduler Auto] Đồng bộ thành công: ${res.importedCount} phòng.`);
      } else {
        console.error(`[Scheduler Auto] Đồng bộ thất bại:`, res.message);
      }
    }, intervalMs);

  } catch (err) {
    console.error('[Scheduler Error] Lỗi khi cập nhật bộ lập lịch:', err.message);
  }
};

export const initImportScheduler = async () => {
  await syncOnStartup();
  await updateSchedulerInterval();
};
