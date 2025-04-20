/**
 * test-fal.js - Diagnostic script for testing Fal.ai API connectivity
 *
 * This script tests different approaches to making requests to the Fal.ai API
 * to diagnose production fetch failure issues.
 *
 * Usage: node test-fal.js
 */

// Fal.ai API key - using the known key prefix
const FAL_KEY =
  "5eda4036-c86a-4637-873b-5f79ea72d588:b58feab09b3bd2bf165e5ba2ff7be918";
const TARGET_URL = "https://queue.fal.run/fal-ai/any-llm";
const TEST_BODY = { prompt: "hello" };

// Import required modules
const axios = require("axios").default;
const { setTimeout } = require("timers/promises");

// Utility function to log request and response details
function logRequestDetails(testName, url, headers, body) {
  console.log(`\n========== TEST CASE: ${testName} ==========`);
  console.log(`Request URL: ${url}`);
  console.log("Headers sent:");
  console.log(JSON.stringify(headers, null, 2));
  console.log("Body sent:");
  console.log(JSON.stringify(body, null, 2));
}

// Utility function to log response details
function logResponseDetails(status, body) {
  console.log(`Response status: ${status}`);
  console.log("Response body:");
  console.log(typeof body === "string" ? body : JSON.stringify(body, null, 2));
  console.log("===========================================\n");
}

// Utility function to log errors
function logError(error) {
  console.error("Error occurred:");
  console.error(error);
  if (error.response) {
    console.error("Response status:", error.response.status);
    console.error("Response data:", error.response.data);
  }
  console.log("===========================================\n");
}

/**
 * TEST CASE A1: Exact replication of curl working request
 * - Method: POST
 * - Headers explicitly set
 * - Body JSON stringified
 */
async function testA1() {
  const headers = {
    Authorization: `Key ${FAL_KEY}`,
    "Content-Type": "application/json",
    "x-fal-target-url": TARGET_URL,
  };

  logRequestDetails(
    "A1 - Exact curl replication",
    TARGET_URL,
    headers,
    TEST_BODY,
  );

  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(TEST_BODY),
    });

    const responseBody = await response.text();
    logResponseDetails(response.status, responseBody);
    return { success: response.ok, status: response.status };
  } catch (error) {
    logError(error);
    return { success: false, error };
  }
}

/**
 * TEST CASE A2: Use Node Headers() object
 * - Tests if Headers object construction affects request handling
 */
async function testA2() {
  const headers = new Headers();
  headers.append("Authorization", `Key ${FAL_KEY}`);
  headers.append("Content-Type", "application/json");
  headers.append("x-fal-target-url", TARGET_URL);

  logRequestDetails(
    "A2 - Using Headers() object",
    TARGET_URL,
    Object.fromEntries(headers.entries()),
    TEST_BODY,
  );

  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(TEST_BODY),
    });

    const responseBody = await response.text();
    logResponseDetails(response.status, responseBody);
    return { success: response.ok, status: response.status };
  } catch (error) {
    logError(error);
    return { success: false, error };
  }
}

/**
 * TEST CASE A3: All headers lowercase
 * - Tests for case-sensitivity issues in header handling
 */
async function testA3() {
  const headers = {
    authorization: `Key ${FAL_KEY}`,
    "content-type": "application/json",
    "x-fal-target-url": TARGET_URL,
  };

  logRequestDetails("A3 - Lowercase headers", TARGET_URL, headers, TEST_BODY);

  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(TEST_BODY),
    });

    const responseBody = await response.text();
    logResponseDetails(response.status, responseBody);
    return { success: response.ok, status: response.status };
  } catch (error) {
    logError(error);
    return { success: false, error };
  }
}

/**
 * TEST CASE A4: Use axios instead of fetch
 * - Tests if the issue is specific to fetch implementation
 */
async function testA4() {
  const headers = {
    Authorization: `Key ${FAL_KEY}`,
    "Content-Type": "application/json",
    "x-fal-target-url": TARGET_URL,
  };

  logRequestDetails("A4 - Using axios", TARGET_URL, headers, TEST_BODY);

  try {
    const response = await axios.post(TARGET_URL, TEST_BODY, { headers });
    logResponseDetails(response.status, response.data);
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
    };
  } catch (error) {
    logError(error);
    return { success: false, error };
  }
}

/**
 * TEST CASE A5: Raw fetch with simplified object construction
 * - No cloning or mutation of objects
 */
async function testA5() {
  logRequestDetails(
    "A5 - Simplified fetch",
    TARGET_URL,
    {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
      "x-fal-target-url": TARGET_URL,
    },
    TEST_BODY,
  );

  try {
    // Direct fetch with minimal object construction
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
        "x-fal-target-url": TARGET_URL,
      },
      body: JSON.stringify(TEST_BODY),
    });

    const responseBody = await response.text();
    logResponseDetails(response.status, responseBody);
    return { success: response.ok, status: response.status };
  } catch (error) {
    logError(error);
    return { success: false, error };
  }
}

// Run all tests sequentially with a delay between them
async function runAllTests() {
  console.log("Starting Fal.ai API connectivity tests...");

  // Run each test with a delay between them to avoid rate limiting
  await testA1();
  await setTimeout(1000);

  await testA2();
  await setTimeout(1000);

  await testA3();
  await setTimeout(1000);

  await testA4();
  await setTimeout(1000);

  await testA5();

  console.log(
    "\nAll tests completed. Check the logs to see which approach succeeded.",
  );
  console.log(
    "After Fabio confirms which test passes, we will port the exact successful structure back into the SDK proxy.",
  );
}

// Run the tests
runAllTests().catch((error) => {
  console.error("Error running tests:", error);
});
