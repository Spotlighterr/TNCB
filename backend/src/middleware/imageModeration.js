import * as tf from '@tensorflow/tfjs';
import * as nsfw from 'nsfwjs';
import sharp from 'sharp';

let nsfwModel = null;
let modelLoadingError = false;

// Pre-load the model to speed up requests
const loadModel = async () => {
  try {
    if (!nsfwModel && !modelLoadingError) {
      console.log('[Moderation] Initializing NSFW image classification model...');
      // By default, loads MobilenetV2 model
      nsfwModel = await nsfw.load();
      console.log('[Moderation] NSFW model loaded successfully.');
    }
  } catch (err) {
    modelLoadingError = true;
    console.warn('[Moderation] Failed to load NSFW model, image moderation will be bypassed:', err.message);
  }
};

// Start loading the model on startup
loadModel();

export const imageModeration = async (req, res, next) => {
  // If no files uploaded, proceed
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // If model loading failed, bypass to prevent service outage
  if (modelLoadingError) {
    return next();
  }

  try {
    // Ensure model is loaded
    if (!nsfwModel) {
      await loadModel();
      if (!nsfwModel) {
        return next();
      }
    }

    const threshold = 0.75; // Reject if Porn, Hentai, or Sexy > 75%
    const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];

    for (const file of req.files) {
      // Decode image and resize to 224x224 (required by Mobilenet) using sharp
      const { data, info } = await sharp(file.buffer)
        .resize(224, 224, { fit: 'fill' })
        .removeAlpha() // Ensure 3 channels (RGB)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Convert flat pixel buffer into 3D Tensor [224, 224, 3]
      const imageTensor = tf.tensor3d(
        new Uint8Array(data),
        [info.height, info.width, 3],
        'int32'
      );

      // Run prediction
      const predictions = await nsfwModel.classify(imageTensor);
      
      // Dispose tensor immediately to avoid memory leaks
      imageTensor.dispose();

      // Check if any unsafe category exceeds the threshold
      for (const pred of predictions) {
        if (nsfwCategories.includes(pred.className) && pred.probability > threshold) {
          console.warn(`[Moderation] Rejected image ${file.originalname}: ${pred.className} = ${(pred.probability * 100).toFixed(2)}%`);
          return res.status(400).json({
            success: false,
            message: 'Hình ảnh tải lên không phù hợp tiêu chuẩn cộng đồng (chứa nội dung nhạy cảm). Vui lòng chọn ảnh khác.'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('[Moderation] Error during image moderation:', error.message);
    // Graceful fallback: do not block upload if verification throws an unexpected error
    next();
  }
};
