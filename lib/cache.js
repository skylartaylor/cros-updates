import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = '.cache';
const CACHE_FILE = path.join(CACHE_DIR, 'device-recovery-cache.json');

export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function generateDataHash(servingBuildsData, recoveryData) {
  const combined = JSON.stringify({
    buildCount: Object.keys(servingBuildsData.builds || {}).length,
    recoveryCount: recoveryData.length,
    servingHash: crypto.createHash('md5').update(JSON.stringify(servingBuildsData)).digest('hex').substring(0, 8),
    recoveryHash: crypto.createHash('md5').update(JSON.stringify(recoveryData)).digest('hex').substring(0, 8)
  });
  return crypto.createHash('md5').update(combined).digest('hex');
}

export function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      return cache;
    }
  } catch (error) {
    console.log('Cache file corrupted, will rebuild:', error.message);
  }
  return null;
}

export function saveCache(data) {
  try {
    ensureCacheDir();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save cache:', error.message);
  }
}
