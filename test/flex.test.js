import test from "node:test";
import assert from "node:assert/strict";
import { render } from "../content/flex.11ty.js";

test("Flex recovery links keep their source channels and default to stable", () => {
  const stableUrl = "https://example.com/stable-152.zip";
  const devUrl = "https://example.com/dev-155.zip";
  const unknownUrl = "https://example.com/unknown-156.zip";
  const html = render({
    assetVersion: "test",
    flexData: {
      versions: { builds: { reven: {} } },
      recoveries: [
        { channel: "DEV", version: "16817.0.0", chrome_version: "155.0.8050.0", url: devUrl },
        { channel: "STABLE", version: "16765.41.0", chrome_version: "152.0.7977.113", url: stableUrl },
        { channel: "UNKNOWN", version: "16830.0.0", chrome_version: "156.0.0.0", url: unknownUrl },
      ],
    },
  });

  assert.match(html, new RegExp(`class="recoveryBtn deviceHeaderBtn" href="${stableUrl}"`));
  assert.match(html, /recovery-channel-header stable">Stable<\/div>[\s\S]*?recovery-link stable"[^>]*>Chrome OS <strong>152<\/strong>/);
  assert.match(html, /recovery-channel-header dev">Dev<\/div>[\s\S]*?recovery-link dev"[^>]*>Chrome OS <strong>155<\/strong>/);
  assert.match(html, /recovery-channel-header other">Other<\/div>[\s\S]*?recovery-link other"[^>]*>Chrome OS <strong>156<\/strong>/);
  assert.doesNotMatch(html, new RegExp(`href="${devUrl}" class="recovery-link stable"`));
  assert.doesNotMatch(html, new RegExp(`href="${unknownUrl}" class="recovery-link stable"`));
});
