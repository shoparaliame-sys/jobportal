import { validateUrl } from "./validator";

export interface FetchResult {
  xml: string;
  etag: string | null;
  lastModified: string | null;
  responseCode: number;
  duration: number;
  notModified: boolean;
}

export async function fetchFeed(
  urlString: string,
  etag?: string | null,
  lastModified?: string | null
): Promise<FetchResult> {
  const url = validateUrl(urlString);
  
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  };

  if (etag) headers["If-None-Match"] = etag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;

  // Retry strategy: 3 attempts. 1st fails -> wait 1s -> 2nd fails -> wait 2s -> 3rd fails -> wait 4s
  const maxRetries = 3;
  let attempt = 0;
  const start = Date.now();

  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds timeout

    try {
      const response = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);
      const responseCode = response.status;
      const duration = Date.now() - start;

      if (responseCode === 304) {
        return {
          xml: "",
          etag: etag || null,
          lastModified: lastModified || null,
          responseCode,
          duration,
          notModified: true,
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        throw new Error(`Invalid content type: HTML received instead of XML/RSS.`);
      }

      const newEtag = response.headers.get("etag");
      const newLastModified = response.headers.get("last-modified");
      const xml = await response.text();

      return {
        xml,
        etag: newEtag,
        lastModified: newLastModified,
        responseCode,
        duration,
        notModified: false,
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // If last attempt, throw the error
      if (attempt === maxRetries) {
        const duration = Date.now() - start;
        const errMsg = error.name === 'AbortError' ? 'Connection timed out' : error.message;
        const finalError = new Error(errMsg);
        (finalError as any).duration = duration;
        throw finalError;
      }
      
      // Exponential backoff
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error("Unexpected error in fetchFeed");
}
