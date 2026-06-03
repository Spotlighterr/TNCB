/**
 * Tính khoảng cách giữa 2 điểm tọa độ GPS sử dụng công thức Haversine (mét)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // mét
}

/**
 * Tính độ tương đồng văn bản Jaccard Similarity giữa 2 chuỗi văn bản
 */
export function getJaccardSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const clean = (s) =>
    s
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(Boolean);
      
  const set1 = new Set(clean(str1));
  const set2 = new Set(clean(str2));
  
  if (set1.size === 0 && set2.size === 0) return 1;
  
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Kiểm tra trùng lặp tin đăng dựa trên thuật toán 3 lớp
 * @param {Object} newProperty Tin đăng mới cần kiểm tra
 * @param {Array} activeProperties Danh sách các tin đăng đang hoạt động của cùng chủ nhà
 * @returns {Object} Kết quả kiểm tra trùng lặp
 */
export function checkDuplicateProperty(newProperty, activeProperties) {
  let maxScore = 0;
  let matchedProperty = null;
  let matchedReasons = [];

  for (const oldPost of activeProperties) {
    // Bỏ qua nếu sửa chính tin này (trùng ID)
    if (newProperty._id && oldPost._id && newProperty._id.toString() === oldPost._id.toString()) {
      continue;
    }

    let score = 0;
    let reasons = [];

    // 1. Kiểm tra vị trí địa lý (GPS)
    if (newProperty.coords && oldPost.coords) {
      const dist = calculateDistance(
        newProperty.coords[0],
        newProperty.coords[1],
        oldPost.coords[0],
        oldPost.coords[1]
      );
      // Nếu cách nhau dưới 15m thì xem như cùng vị trí vật lý (Tòa nhà)
      if (dist < 15) {
        score += 40;
        reasons.push('Trùng khớp vị trí địa lý (khoảng cách < 15m)');
      }
    }

    // Nếu không trùng vị trí địa lý (khác tòa nhà) thì chắc chắn khác phòng trọ, bỏ qua
    if (score === 0) continue;

    // 2. Kiểm tra loại phòng, giá thuê và diện tích
    const isSameType = newProperty.type === oldPost.type;
    const isSamePrice = Number(newProperty.price) === Number(oldPost.price);
    const isSameArea = Number(newProperty.area) === Number(oldPost.area);

    if (isSameType && isSamePrice && isSameArea) {
      score += 30;
      reasons.push('Trùng khớp loại phòng, giá thuê và diện tích');
    }

    // 3. Tính toán độ tương đồng văn bản (Tiêu đề + Mô tả)
    const textSim = getJaccardSimilarity(
      (newProperty.title || '') + ' ' + (newProperty.description || ''),
      (oldPost.title || '') + ' ' + (oldPost.description || '')
    );

    if (textSim >= 0.7) {
      score += 20;
      reasons.push(`Nội dung văn bản tương đồng cao (${Math.round(textSim * 100)}%)`);
    }

    // 4. So sánh ảnh
    const hasOverlapImg = newProperty.images && oldPost.images &&
      newProperty.images.some(img => oldPost.images.includes(img));
    if (hasOverlapImg) {
      score += 10;
      reasons.push('Phát hiện hình ảnh trùng lặp');
    }

    if (score > maxScore) {
      maxScore = score;
      matchedProperty = oldPost;
      matchedReasons = reasons;
    }
  }

  return {
    isDuplicate: maxScore >= 80,
    isSuspicious: maxScore >= 50 && maxScore < 80,
    confidenceScore: maxScore,
    matchedProperty,
    reasons: matchedReasons,
  };
}
