import Property from './Property.js';

class BloomFilter {
  constructor(size = 50000, falsePositiveRate = 0.01) {
    this.n = size;
    this.p = falsePositiveRate;
    this.m = Math.ceil(- (this.n * Math.log(this.p)) / (Math.log(2) ** 2));
    this.k = Math.ceil((this.m / this.n) * Math.log(2));
    
    // Uint8Array for bitwise storage
    this.bitArray = new Uint8Array(Math.ceil(this.m / 8));
  }

  // FNV-1a non-cryptographic fast hash implementation with seeds
  _hashes(string) {
    const hashes = [];
    for (let i = 0; i < this.k; i++) {
      let hash = 0x811c9dc5 ^ i;
      for (let j = 0; j < string.length; j++) {
        hash ^= string.charCodeAt(j);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      hashes.push(Math.abs(hash) % this.m);
    }
    return hashes;
  }

  add(string) {
    if (!string) return;
    const indices = this._hashes(string.toString().toLowerCase());
    for (const idx of indices) {
      const byteIdx = Math.floor(idx / 8);
      const bitIdx = idx % 8;
      this.bitArray[byteIdx] |= (1 << bitIdx);
    }
  }

  test(string) {
    if (!string) return false;
    const indices = this._hashes(string.toString().toLowerCase());
    for (const idx of indices) {
      const byteIdx = Math.floor(idx / 8);
      const bitIdx = idx % 8;
      if ((this.bitArray[byteIdx] & (1 << bitIdx)) === 0) {
        return false; // Definitely not in set
      }
    }
    return true; // Probably in set
  }
}

// Instantiate singleton Bloom Filter for Property IDs
export const propertyBloomFilter = new BloomFilter();

// Load all existing Property IDs from the database
export const initPropertyBloomFilter = async () => {
  try {
    console.log('🔮 Initializing Property Bloom Filter...');
    const startTime = Date.now();
    
    const properties = await Property.find({}, '_id');
    properties.forEach(p => {
      propertyBloomFilter.add(p._id.toString());
    });
    
    console.log(`✅ Loaded ${properties.length} Property IDs into Bloom Filter in ${Date.now() - startTime}ms.`);
  } catch (err) {
    console.error('❌ Failed to initialize Property Bloom Filter:', err.message);
  }
};

// Express Middleware to intercept invalid / non-existent IDs
export const checkPropertyBloomFilter = (req, res, next) => {
  const { id } = req.params;

  // 1. Validate if the ID matches standard MongoDB ObjectId hex structure (24 chars)
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thông tin phòng trọ (Định dạng ID không hợp lệ).'
    });
  }

  // 2. Query Bloom Filter (100% accurate for negative match)
  if (!propertyBloomFilter.test(id)) {
    // console.log(`[BloomFilter] Blocked access to non-existent ID: ${id}`);
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy thông tin phòng trọ.'
    });
  }

  // 3. Positive match (might exist, proceed to DB query)
  next();
};
