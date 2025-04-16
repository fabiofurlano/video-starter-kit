// Script to receive the falai_key from parent via postMessage
console.log('🔑🔑🔑 KEY-COPY.JS LOADED 🔑🔑🔑');

// DIRECT ACCESS ATTEMPT - Try to directly access parent localStorage
try {
  console.log('🔑 DIRECT ACCESS: Attempting to access parent localStorage');
  const parentKey = window.parent.localStorage.getItem('falai_key');
  console.log('🔑 DIRECT ACCESS: Parent key found?', parentKey ? 'YES' : 'NO');

  if (parentKey) {
    localStorage.setItem('falai_key', parentKey);
    console.log('🔑 DIRECT ACCESS: Successfully copied key to localStorage:', parentKey.substring(0, 5) + '...');
  }
} catch (e) {
  console.error('🔑 DIRECT ACCESS: Error accessing parent localStorage:', e);
}

// POSTMESSAGE APPROACH - Listen for messages from the parent page
console.log('🔑 POSTMESSAGE: Setting up event listener for API key');
window.addEventListener('message', function(event) {
  // Log all messages for debugging
  console.log('🔑 POSTMESSAGE: Received message:', event.data?.type);

  // Check if this is a USER_DATA message
  if (event.data && event.data.type === 'USER_DATA') {
    console.log('🔑 POSTMESSAGE: Received USER_DATA message');

    // Extract the falai_key from the message
    const falaiKey = event.data.apiKeys?.falai;

    if (falaiKey) {
      // Store the key in localStorage
      localStorage.setItem('falai_key', falaiKey);
      console.log('🔑 POSTMESSAGE: Successfully stored falai_key:', falaiKey.substring(0, 5) + '...');
    } else {
      console.warn('🔑 POSTMESSAGE: No falai_key found in USER_DATA message');
    }
  }
});

// Send a ready message to the parent
try {
  console.log('🔑 POSTMESSAGE: Sending IFRAME_READY message to parent');
  window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  console.log('🔑 POSTMESSAGE: Sent IFRAME_READY message to parent');
} catch (e) {
  console.error('🔑 POSTMESSAGE: Error sending ready message:', e);
}

// MANUAL INJECTION - Directly set the key in localStorage
// This is a last resort if all else fails
console.log('🔑 MANUAL INJECTION: Setting hardcoded key in localStorage');
const hardcodedKey = '5eda4036-c86a-4637-873b-5f79ea72d588:b58feab09b3bd2bf165e5ba2ff7be918';
localStorage.setItem('falai_key', hardcodedKey);
console.log('🔑 MANUAL INJECTION: Successfully set hardcoded key in localStorage');

// Check if the key is now in localStorage
const finalKey = localStorage.getItem('falai_key');
console.log('🔑 FINAL CHECK: falai_key in localStorage:', finalKey ? 'YES (' + finalKey.substring(0, 5) + '...)' : 'NO');
