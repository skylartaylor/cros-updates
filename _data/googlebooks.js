import { GOOGLEBOOK_CATALOG_URL, processGooglebookCatalog, addDownloadDetails } from '../lib/googlebook.js';

export default async function () {
  const response = await fetch(GOOGLEBOOK_CATALOG_URL, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Googlebook catalog fetch failed: ${response.status}`);
  // Fail the build rather than publish an empty catalog or remove device URLs.
  return addDownloadDetails(processGooglebookCatalog(await response.json()));
}
