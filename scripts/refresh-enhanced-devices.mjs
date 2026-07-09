import enhancedDevicesLoader from "../_data/enhanced-devices.js";

try {
  await enhancedDevicesLoader();
  console.log('✓ Successfully refreshed enhanced device data');
  process.exit(0);
} catch (error) {
  console.error('✗ Refresh failed:', error.message);
  process.exit(1);
}
