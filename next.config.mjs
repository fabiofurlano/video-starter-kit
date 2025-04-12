/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in the SDK application.
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Allow embedding from self, localhost, staging (mecai.app), and production (novelvisionai.art)
            value: "frame-ancestors 'self' http://localhost:8000 https://mecai.app https://novelvisionai.art;",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
