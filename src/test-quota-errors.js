/**
 * Quota Exceeded Error Testing Script
 *
 * This script injects quota exceeded errors into the Fal.ai client to test
 * the error handling across all components without making actual API calls.
 *
 * Instructions:
 * 1. Import this script in your application entry point (e.g., _app.tsx)
 * 2. Call enableQuotaErrorTesting() to enable error injection
 * 3. Use the toggleErrorFor() function to enable/disable errors for specific features
 */

// Store the original fal client
let originalFal = null;

// Track which features should return quota errors
const errorFlags = {
  promptEnhancement: false,
  mediaGeneration: false,
  videoExport: false,
  audioWaveform: false,
  mediaMetadata: false,
  projectSuggestion: false,
  allFeatures: false,
};

/**
 * Enable quota error testing by patching the fal client
 */
export function enableQuotaErrorTesting() {
  if (typeof window === "undefined") return;

  // Store reference to original fal module
  try {
    originalFal = require("./lib/fal").fal;

    // Create a testing UI
    createTestingUI();

    // Patch the fal client
    patchFalClient();

    console.log("🧪 Quota error testing enabled");
  } catch (error) {
    console.error("Failed to enable quota error testing:", error);
  }
}

/**
 * Patch the fal client to inject quota exceeded errors
 */
function patchFalClient() {
  if (!originalFal) return;

  const fal = require("./lib/fal");

  // Patch fal.subscribe
  const originalSubscribe = originalFal.subscribe;
  fal.fal.subscribe = async (endpoint, options) => {
    console.log(`🧪 fal.subscribe called for ${endpoint}`);

    // Check if we should inject an error based on the endpoint
    if (errorFlags.allFeatures) {
      throw new Error("Free tier quota exceeded");
    }

    if (endpoint === "fal-ai/any-llm" && errorFlags.promptEnhancement) {
      throw new Error("Free tier quota exceeded");
    }

    if (endpoint === "fal-ai/ffmpeg-api/waveform" && errorFlags.audioWaveform) {
      throw new Error("Free tier quota exceeded");
    }

    if (endpoint === "fal-ai/ffmpeg-api/metadata" && errorFlags.mediaMetadata) {
      throw new Error("Free tier quota exceeded");
    }

    if (endpoint === "fal-ai/ffmpeg-api/compose" && errorFlags.videoExport) {
      throw new Error("Free tier quota exceeded");
    }

    // Call the original function if no error was injected
    return originalSubscribe(endpoint, options);
  };

  // Patch fal.queue.submit
  const originalSubmit = originalFal.queue.submit;
  fal.fal.queue.submit = async (endpoint, options) => {
    console.log(`🧪 fal.queue.submit called for ${endpoint}`);

    if (errorFlags.allFeatures || errorFlags.mediaGeneration) {
      throw new Error("quota exceeded");
    }

    return originalSubmit(endpoint, options);
  };
}

/**
 * Toggle error injection for a specific feature
 * @param {string} feature - The feature to toggle error injection for
 * @param {boolean} enabled - Whether to enable or disable error injection
 */
export function toggleErrorFor(feature, enabled) {
  if (errorFlags.hasOwnProperty(feature)) {
    errorFlags[feature] = enabled;
    console.log(
      `🧪 Error injection for ${feature} ${enabled ? "enabled" : "disabled"}`,
    );
    updateUI();
  }
}

/**
 * Create a testing UI to toggle error injection
 */
function createTestingUI() {
  if (typeof document === "undefined") return;

  // Create container
  const container = document.createElement("div");
  container.id = "quota-error-testing";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  container.style.color = "white";
  container.style.padding = "10px";
  container.style.borderRadius = "5px";
  container.style.zIndex = "9999";
  container.style.maxWidth = "300px";

  // Create header
  const header = document.createElement("div");
  header.textContent = "Quota Error Testing";
  header.style.fontWeight = "bold";
  header.style.marginBottom = "10px";
  container.appendChild(header);

  // Create toggle for each feature
  Object.keys(errorFlags).forEach((feature) => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "5px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = errorFlags[feature];
    checkbox.dataset.feature = feature;
    checkbox.addEventListener("change", (e) => {
      toggleErrorFor(feature, e.target.checked);
    });

    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(` ${formatFeatureName(feature)}`),
    );
    container.appendChild(label);
  });

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "10px";
  closeButton.style.padding = "5px 10px";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(container);
  });
  container.appendChild(closeButton);

  // Add to document
  document.body.appendChild(container);
}

/**
 * Update the testing UI to reflect current error flags
 */
function updateUI() {
  if (typeof document === "undefined") return;

  const container = document.getElementById("quota-error-testing");
  if (!container) return;

  Object.keys(errorFlags).forEach((feature) => {
    const checkbox = container.querySelector(
      `input[data-feature="${feature}"]`,
    );
    if (checkbox) {
      checkbox.checked = errorFlags[feature];
    }
  });
}

/**
 * Format feature name for display
 * @param {string} feature - The feature name
 * @returns {string} - Formatted feature name
 */
function formatFeatureName(feature) {
  return feature
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

// Auto-enable testing in development mode
if (process.env.NODE_ENV === "development") {
  enableQuotaErrorTesting();
}
