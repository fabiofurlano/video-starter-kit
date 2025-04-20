import { NextResponse, NextRequest } from "next/server";

// Function to forward request to Fal.ai
async function forwardToFal(req: NextRequest) {
  console.log("🔍 API ROUTE: Request received at /api/fal");
  console.log("🟢 /api/fal route hit");

  try {
    // Parse the URL
    const url = new URL(req.url);
    console.log(`🔍 Request: ${req.method} ${url.pathname}${url.search}`);

    // CHECKPOINT B: Incoming headers
    const incomingHeadersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      incomingHeadersObj[key] = value;
    });
    console.log(
      "🔍 Incoming headers:",
      JSON.stringify(incomingHeadersObj, null, 2),
    );

    // IMPORTANT: The path should be extracted differently based on the official docs
    // For the fal.ai client, we need to:
    // 1. Get the target URL from the x-fal-target-url header if it exists
    // 2. Otherwise, extract it from the path segments

    // First check if the client set the target URL in headers (this is used by the official client)
    let targetUrl = req.headers.get("x-fal-target-url");

    if (!targetUrl) {
      // If not, extract from path - this is a fallback for direct calls
      // Extract everything after /api/fal/ from the path
      const pathMatch = url.pathname.match(/\/api\/fal\/(.*)/);
      if (pathMatch && pathMatch[1]) {
        targetUrl = `https://rest.fal.ai/${pathMatch[1]}`;
      } else {
        console.error("❌ No target URL found in headers or path");
        return new NextResponse("Bad Request: No target URL specified", {
          status: 400,
        });
      }
    }

    console.log(`🔍 Target URL: ${targetUrl}`);
    // CHECKPOINT C: Target URL
    console.log("🎥 Target URL:", targetUrl);

    // Get request body if it exists
    let requestBody: any = null;
    let contentType = req.headers.get("content-type") || "";

    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        if (contentType.includes("application/json")) {
          requestBody = await req.json();
          console.log(
            "🔍 Request body:",
            JSON.stringify(requestBody).substring(0, 200) + "...",
          );
          // CHECKPOINT C: Request body
          console.log("📝 Request body:", JSON.stringify(requestBody, null, 2));
        } else {
          // Handle other content types if needed
          requestBody = await req.text();
          console.log(
            "🔍 Request body (non-JSON):",
            (requestBody as string).substring(0, 200) + "...",
          );
        }
      } catch (err) {
        console.log("⚠️ Could not parse request body:", err);
      }
    }

    // Get auth header from request or from the client app
    let authHeader = req.headers.get("authorization");

    // Check for API key in request headers first (client-side)
    if (!authHeader || !authHeader.startsWith("Key ")) {
      console.log("⚠️ No Authorization header found in request");

      // Fall back to environment variable if available (server-side)
      const envApiKey = process.env.FAL_KEY;

      if (envApiKey) {
        console.log("🔍 Using API key from environment variable");
        authHeader = `Key ${envApiKey}`;
      } else {
        console.error(
          "❌ No API key available (neither in headers nor environment)",
        );
        return new NextResponse("Unauthorized: Missing API key", {
          status: 401,
        });
      }
    } else {
      console.log("🔍 Using API key from request headers");
    }

    // Clone the headers to avoid modifying the original request
    const headers = new Headers();

    // Copy all headers from the original request
    req.headers.forEach((value, key) => {
      // Skip the host header as it would be invalid for the forwarded request
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });

    // Set the content type and authorization headers
    headers.set("Content-Type", contentType);
    headers.set("Authorization", authHeader);

    console.log(`🔍 Forwarding to: ${targetUrl}`);

    // Log detailed request information for debugging
    // Convert headers to a plain object for logging
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log(`🔍 Headers: ${JSON.stringify(headerObj).substring(0, 500)}`);
    console.log(
      `🔍 Body: ${requestBody ? JSON.stringify(requestBody).substring(0, 200) + "..." : "undefined"}`,
    );

    try {
      // Forward the request - hardcode POST to match curl behavior
      // Create a plain object for headers (Test A5 style)
      const plainHeaders: Record<string, string> = {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "x-fal-target-url": targetUrl,
      };

      // Copy any other important headers from the original request
      headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (
          !["authorization", "content-type", "x-fal-target-url"].includes(
            lowerKey,
          )
        ) {
          plainHeaders[key] = value;
        }
      });

      // CHECKPOINT D: Outgoing headers to Fal
      console.log(
        "📤 Outgoing headers to Fal.ai:",
        JSON.stringify(plainHeaders, null, 2),
      );

      // CHECKPOINT E: Fetch success/failure
      let forwardedResponse;
      try {
        forwardedResponse = await fetch(targetUrl, {
          method: "POST", // Hardcode to POST to match curl
          headers: plainHeaders,
          body: JSON.stringify(requestBody), // Always stringify as JSON
        });

        // Log response status
        console.log(`🔍 Fal.ai response status: ${forwardedResponse.status}`);
        console.log("✅ Fetch status:", forwardedResponse.status);
      } catch (error) {
        console.error(
          "❌ FETCH FAILED:",
          error instanceof Error ? error.message : String(error),
        );
        throw error; // Re-throw to be caught by the outer try/catch
      }

      // Get response data
      let responseData;
      try {
        responseData = await forwardedResponse.text();
        console.log(`🔍 Response body: ${responseData.substring(0, 200)}...`);
        // CHECKPOINT E: Response body
        console.log("📦 Response body:", responseData.substring(0, 500));

        // Create response with same status and headers
        const responseHeaders = new Headers();
        forwardedResponse.headers.forEach((value, key) => {
          responseHeaders.set(key, value);
        });

        const response = new NextResponse(responseData, {
          status: forwardedResponse.status,
          statusText: forwardedResponse.statusText,
          headers: responseHeaders,
        });

        if (forwardedResponse.ok) {
          console.log("✅ Successfully proxied request to Fal.ai");
        } else {
          console.error(
            `❌ Fal.ai returned error status: ${forwardedResponse.status}`,
          );
        }

        return response;
      } catch (error) {
        console.error("❌ Error reading response body:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to read response";
        return new NextResponse(JSON.stringify({ error: errorMessage }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("❌ Error in Fal.ai fetch:", error);
      // Handle error safely with type checking
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Error details:", errorMessage);
      return new NextResponse(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("❌ Error in Fal.ai proxy:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Export the HTTP methods
export async function GET(req: NextRequest) {
  return forwardToFal(req);
}

export async function POST(req: NextRequest) {
  return forwardToFal(req);
}

export async function PUT(req: NextRequest) {
  return forwardToFal(req);
}
