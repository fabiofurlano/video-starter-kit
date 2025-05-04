/**
 * Quota Manager for Fal.ai API calls
 * Handles tracking and enforcing free tier usage limits
 */

/**
 * Check if the user has premium status
 * @returns true if the user is marked as premium
 */
export function isPremiumUser(): boolean {
  const isPremium = localStorage?.getItem("premium_user") === "true";
  console.log("🚨 QUOTA-GUARD-TEST: isPremiumUser() =", isPremium, "(localStorage value: '", localStorage?.getItem("premium_user"), "')");
  return isPremium;
}

/**
 * Get the current count of free API calls made
 * @returns number of API calls made in the free tier
 */
export function getFreeApiCalls(): number {
  const count = parseInt(localStorage?.getItem("free_api_calls") || "0");
  console.log("🚨 QUOTA-GUARD-TEST: getFreeApiCalls() =", count, "(localStorage value: '", localStorage?.getItem("free_api_calls"), "')");
  return count;
}

/**
 * Increment the count of free API calls
 */
export function incrementFreeApiCalls(): void {
  const count = getFreeApiCalls();
  localStorage?.setItem("free_api_calls", String(count + 1));
  console.log(`🚨 QUOTA-GUARD-TEST: Incremented free API calls from ${count} to ${count + 1}`);
}

/**
 * Check if the user has exceeded their free tier quota
 * @returns true if the user has reached or exceeded the free tier limit
 */
export function quotaExceeded(): boolean {
  const isExceeded = getFreeApiCalls() >= 10;
  console.log("🚨 QUOTA-GUARD-TEST: quotaExceeded() =", isExceeded);
  return isExceeded;
}

/**
 * Reset the free API calls counter to zero
 * Useful for testing or administrative purposes
 */
export function resetQuota(): void {
  localStorage?.setItem("free_api_calls", "0");
}

/**
 * Determine if a request should be counted against the quota
 * @param url The request URL
 * @param method The request method
 * @returns true if the request should be counted against the quota
 */
export function shouldCountRequest(url: string, method: string): boolean {
  // Don't count status checks
  if (url.includes('/status') || url.includes('status=')) {
    console.log(`🚨 QUOTA-GUARD-TEST: Not counting status check request: ${url}`);
    return false;
  }
  
  // Don't count result retrievals
  if (url.includes('/result') || url.includes('result=')) {
    console.log(`🚨 QUOTA-GUARD-TEST: Not counting result retrieval request: ${url}`);
    return false;
  }
  
  // Don't count polling requests
  if (url.includes('polling=true') || url.includes('mode=polling')) {
    console.log(`🚨 QUOTA-GUARD-TEST: Not counting polling request: ${url}`);
    return false;
  }
  
  // Count initial feature requests (POST requests to endpoints)
  const shouldCount = method.toUpperCase() === 'POST';
  console.log(`🚨 QUOTA-GUARD-TEST: shouldCountRequest(${url}, ${method}) = ${shouldCount}`);
  return shouldCount;
}
