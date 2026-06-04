import { profanityList } from '../config/profanityList.js';

/**
 * Middleware to check request body fields (title, description, address)
 * for profane, vulgar, or restricted Vietnamese terms.
 */
export const textModeration = (req, res, next) => {
  const fieldsToScan = ['title', 'description', 'address'];
  const foundWords = [];

  for (const field of fieldsToScan) {
    const content = req.body[field];
    if (!content || typeof content !== 'string') continue;

    // 1. Normalize text: lowercase
    const lowercaseContent = content.toLowerCase();

    // 2. Normalize text by replacing common obfuscation symbols with space to isolate words
    const cleanedContent = lowercaseContent.replace(/[._\-*+~,;:()|[\]{}]/g, ' ').replace(/\s+/g, ' ');
    
    // 3. Compress punctuation entirely (e.g. "đ_é_o" -> "đéo", "m.a t.ú.y" -> "ma túy")
    const compressedContent = lowercaseContent.replace(/[._\-*+~,;:()|[\]{}]/g, '').replace(/\s+/g, ' ');

    // Split content into words/tokens
    const tokens = cleanedContent.split(/\s+/).filter(Boolean);
    const compressedTokens = compressedContent.split(/\s+/).filter(Boolean);

    for (const bannedWord of profanityList) {
      const lowerBanned = bannedWord.toLowerCase();

      // Check if it's a multi-word term (e.g., "ma túy", "hiếp dâm")
      if (lowerBanned.includes(' ')) {
        if (cleanedContent.includes(lowerBanned) || compressedContent.includes(lowerBanned)) {
          foundWords.push(bannedWord);
        }
      } else {
        // Exact single word matching to prevent false positives (e.g. "đèo" matching "đéo")
        const isBanned = tokens.includes(lowerBanned) || compressedTokens.includes(lowerBanned);
        if (isBanned) {
          foundWords.push(bannedWord);
        }
      }
    }
  }

  if (foundWords.length > 0) {
    const uniqueFound = [...new Set(foundWords)];
    return res.status(400).json({
      success: false,
      message: `Nội dung tin đăng chứa từ ngữ không phù hợp: ${uniqueFound.join(', ')}. Vui lòng chỉnh sửa lại.`
    });
  }

  next();
};
