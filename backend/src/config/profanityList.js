// Detailed list of sensitive, vulgar, and prohibited words in Vietnamese.
// Used by the textModeration middleware to filter toxic listings.

export const profanityList = [
  // Swear words, vulgar words (Từ tục tĩu, chửi thề)
  'đéo', 'lồn', 'cặc', 'buồi', 'dái', 'đĩ', 'điếm', 'phịch', 'chịch', 'nứng',
  'địt', 'mẹ kiếp', 'vcl', 'đcm', 'dkm', 'clgt', 'vú', 'mông', 'dâm', 'bím',
  'đâm bang', 'bú', 'liếm', 'óc chó', 'súc vật', 'chó đẻ', 'ăn phân',
  
  // Sexual / NSFW terms (Từ ngữ khiêu dâm, nhạy cảm)
  'hiếp dâm', 'ấu dâm', 'bán dâm', 'mua dâm', 'khiêu dâm', 'hành dâm',
  'bộ phận sinh dục', 'dương vật', 'âm hộ', 'thủ dâm', 'bạo dâm', 'khỏa thân',
  'sex', 'porn', 'hentai', 'nsfw',
  
  // Illegal substances, gambling (Chất cấm, bài bạc, tệ nạn)
  'ma túy', 'hút chích', 'thuốc phiện', 'đập đá', 'cờ bạc', 'lô đề', 'cá độ',
  'thuốc lắc', 'hạt cần', 'cần sa', 'bóng cười', 'cá cược', 'đánh bạc',
  
  // Scams, weapon, violence (Lừa đảo, bạo lực, vũ khí)
  'lừa đảo', 'hack', 'cheat', 'bán thận', 'rửa tiền', 'mại dâm', 'giết người',
  'khủng bố', 'chế tạo bom', 'súng đạn', 'vũ khí sát thương',
  
  // Political / Extremism (Chính trị nhạy cảm, phản động, kích động)
  'phản động', 'kích động', 'biểu tình', 'lật đổ', 'chế độ cũ', 'đảng cướp'
];
