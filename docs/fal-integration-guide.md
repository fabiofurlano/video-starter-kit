# Fal.ai Integration Troubleshooting Guide

## Understanding the Flow

The Fal.ai integration follows this pattern:

1. **Client Side**: The app gets an API key from localStorage
2. **Client Side**: Makes request to our local proxy (`/api/fal`)
3. **Server Side**: Proxy extracts target URL from headers
4. **Server Side**: Proxy forwards request to Fal.ai
5. **Server Side**: Proxy returns Fal.ai response to client

## Common Issues

### 1. 400 Bad Request Error

This typically happens when the Fal.ai API doesn't understand your request.

#### Symptoms:
```
POST http://localhost:3000/api/fal 400 (Bad Request)
```

#### Solutions:

- **Check x-fal-target-url header**: Make sure your client is setting this header properly.

```typescript
// In fal.ts
requestMiddleware: async (request) => {
  // Make sure this header is being set
  request.headers = {
    ...request.headers,
    "x-fal-target-url": request.url
  };
  return request;
}
```

- **Check proxy implementation**: Ensure your route.ts correctly extracts and forwards to this URL.

```typescript
// In route.ts
const targetUrl = req.headers.get("x-fal-target-url");
if (!targetUrl) {
  return new NextResponse("Missing target URL", { status: 400 });
}
```

### 2. 401 Unauthorized Error

This happens when your API key isn't valid or isn't being passed correctly.

#### Symptoms:
```
❌ No API key available (neither in headers nor environment)
```

#### Solutions:

- **Check localStorage**: Make sure the API key is correctly saved.

```javascript
// In browser console
localStorage.getItem("falai_key") // Should return your API key
```

- **Check Authorization Header Format**: The header must be `Key YOUR_API_KEY`

```typescript
// In your code
headers.set("Authorization", `Key ${apiKey}`);
```

### 3. DNS Resolution Errors

These happen when your application can't connect to Fal.ai servers.

#### Symptoms:
```
ERR_NAME_NOT_RESOLVED when trying to fetch from "https://rest.fal.ai/..."
```

#### Solutions:

- Check your network connection
- Ensure no firewalls are blocking the connection
- Try a different network

## Detailed Implementation

### Client-Side (fal.ts)

```typescript
export const fal = createFalClient({
  // This tells the client to use our custom proxy
  proxyUrl: "/api/fal",
  
  // Gets the API key from localStorage
  credentials: () => {
    if (typeof window === "undefined") {
      return ""; // Empty string on server-side
    }
    return localStorage?.getItem("falai_key") || "";
  },
  
  // This runs before each request
  requestMiddleware: async (request) => {
    const apiKey = typeof window !== "undefined" ? 
      localStorage?.getItem("falai_key") || "" : "";
    
    if (apiKey) {
      request.headers = {
        ...request.headers,
        "Authorization": `Key ${apiKey}`,
        // THIS IS CRUCIAL - tells our proxy where to forward the request
        "x-fal-target-url": request.url
      };
    }
    
    return request;
  }
});
```

### Server-Side (route.ts)

```typescript
async function forwardToFal(req: NextRequest) {
  try {
    // Get the target URL from the header
    let targetUrl = req.headers.get("x-fal-target-url");
    
    if (!targetUrl) {
      // Fallback to path extraction if header not present
      const pathMatch = url.pathname.match(/\/api\/fal\/(.*)/);
      if (pathMatch && pathMatch[1]) {
        targetUrl = `https://rest.fal.ai/${pathMatch[1]}`;
      } else {
        return new NextResponse("Bad Request: No target URL specified", { status: 400 });
      }
    }
    
    // Get API key from headers or environment
    let authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Key ")) {
      const envApiKey = process.env.FAL_KEY;
      
      if (envApiKey) {
        authHeader = `Key ${envApiKey}`;
      } else {
        return new NextResponse("Unauthorized: Missing API key", { status: 401 });
      }
    }
    
    // Forward the request to Fal.ai
    const forwardedResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...headers,
        "Authorization": authHeader
      },
      body: requestBody
    });
    
    // Return the response to the client
    return new NextResponse(responseData, {
      status: forwardedResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
```

## Debug Logging

If you're still having issues, add these debug logs to track the entire flow:

### In fal.ts
```typescript
console.log("🔍 API key from localStorage:", apiKey ? "Found" : "NOT FOUND");
console.log("🔍 Target URL:", request.url);
```

### In route.ts
```typescript
console.log("🔍 Request received at /api/fal");
console.log("🔍 Target URL from headers:", targetUrl);
console.log("🔍 Auth header present:", !!authHeader);
console.log("🔍 Response status:", forwardedResponse.status);
```

## Remember

The key components that make this work:
1. Setting the `x-fal-target-url` header in the client
2. Reading this header in the proxy
3. Proper authentication with the `Key` prefix
4. Correct forwarding of all request details

If any part of this chain breaks, the integration will fail. 