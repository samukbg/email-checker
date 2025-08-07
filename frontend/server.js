// Simple static file server for WinterJS
import { serve } from "winterjs/serve";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const staticDir = "./out";

serve({
  port: 8080,
  fetch: async (request) => {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Default to index.html for root path
    if (pathname === "/") {
      pathname = "/index.html";
    }
    
    const filePath = join(staticDir, pathname);
    
    try {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        const contentType = getContentType(pathname);
        
        return new Response(content, {
          headers: {
            "Content-Type": contentType,
          },
        });
      }
    } catch (error) {
      console.error("Error serving file:", error);
    }
    
    // Return 404 for missing files
    return new Response("Not Found", { status: 404 });
  },
});

function getContentType(pathname) {
  if (pathname.endsWith(".html")) return "text/html";
  if (pathname.endsWith(".js")) return "application/javascript";
  if (pathname.endsWith(".css")) return "text/css";
  if (pathname.endsWith(".json")) return "application/json";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return "text/plain";
}