import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CACHE_FILE = '_data/enhanced-devices-cache.json';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchDeviceData(board) {
  try {
    const url = `https://raw.githubusercontent.com/jay0lee/chromeos-update-directory/main/data/updates/${board}/stable/data.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Parse kernel version to remove git hash and build info after dashes
    let kernelVersion = null;
    if (data.linux_kernel_versions?.[0]) {
      const fullKernelVersion = data.linux_kernel_versions[0];
      // Extract just the main version (before first dash)
      kernelVersion = fullKernelVersion.split('-')[0];
    }
    
    return {
      android_app_support: data.android_app_support || false,
      android_version: data.android_version || null,
      is_chromebook_plus_device: data.is_chromebook_plus_device || false,
      kernel_version: kernelVersion,
      eol_reached: data.eol_reached || false,
      hardware_id: data.sample_hwid || null,
      architecture: data.architecture || null
    };
  } catch (error) {
    return null;
  }
}

async function loadCachedData() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return { timestamp: 0, data: {} };
    }
    
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    return cached;
  } catch (error) {
    console.warn('Error loading cached data:', error.message);
    return { timestamp: 0, data: {} };
  }
}

async function saveCachedData(data) {
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: data
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(`Enhanced device data cached for ${Object.keys(data).length} boards`);
  } catch (error) {
    console.error('Error saving cached data:', error.message);
  }
}

export default async function() {
  console.log('Loading enhanced device data...');
  
  // Load existing cache
  const cached = await loadCachedData();
  const now = Date.now();
  const cacheAge = now - cached.timestamp;
  
  // Return cached data if it's fresh (less than 24 hours old)
  if (cacheAge < CACHE_DURATION && Object.keys(cached.data).length > 0) {
    console.log(`Using cached enhanced device data (${Math.round(cacheAge / (1000 * 60 * 60))} hours old)`);
    return cached.data;
  }
  
  console.log('Cache expired or empty, fetching fresh enhanced device data...');
  
  // Fetch current crosBuilds data to get all board names
  let allBoards = [];
  try {
    const response = await fetch("https://chromiumdash.appspot.com/cros/fetch_serving_builds", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    
    if (response.ok) {
      const json = await response.json();
      if (json && json.builds) {
        allBoards = Object.keys(json.builds);
        console.log(`Found ${allBoards.length} boards in crosBuilds data`);
      }
    }
  } catch (error) {
    console.error('Error fetching crosBuilds data:', error);
  }
  
  // Fallback to known boards if API fails
  if (allBoards.length === 0) {
    console.log('Falling back to known boards list');
    allBoards = [
      'brya', 'volteer', 'dedede', 'hatch', 'octopus', 'coral', 'atlas', 
      'nocturne', 'eve', 'fizz', 'poppy', 'reef', 'gru', 'kevin', 'oak',
      'braswell', 'baytrail', 'auron', 'buddy', 'butterfly', 'link', 'lumpy'
    ];
  }
  
  const enhancedData = {};
  const batchSize = 10; // Increased batch size for better performance
  
  for (let i = 0; i < allBoards.length; i += batchSize) {
    const batch = allBoards.slice(i, i + batchSize);
    const promises = batch.map(board => fetchDeviceData(board));
    const results = await Promise.all(promises);
    
    results.forEach((data, index) => {
      if (data) {
        enhancedData[batch[index]] = data;
      }
    });
    
    // Small delay between batches to be respectful to the server
    if (i + batchSize < allBoards.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log(`Successfully loaded enhanced data for ${Object.keys(enhancedData).length} boards`);
  
  // Save the fetched data
  await saveCachedData(enhancedData);
  
  return enhancedData;
}