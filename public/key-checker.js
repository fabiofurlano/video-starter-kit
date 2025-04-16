// This script checks if the falai_key is in localStorage
// If not, it redirects to the key-injector.html page

(function () {
  console.log("🔑 KEY CHECKER: Script loaded");

  // Check if the falai_key is in localStorage
  const key = localStorage.getItem("falai_key");
  console.log("🔑 KEY CHECKER: falai_key in localStorage:", key ? "YES" : "NO");

  if (!key) {
    // If the key is not in localStorage, redirect to the key-injector.html page
    console.log(
      "🔑 KEY CHECKER: No falai_key found in localStorage, redirecting to key-injector.html",
    );
    window.location.href = "/key-injector.html";
  } else {
    console.log(
      "🔑 KEY CHECKER: falai_key found in localStorage:",
      key.substring(0, 5) + "...",
    );
  }
})();
