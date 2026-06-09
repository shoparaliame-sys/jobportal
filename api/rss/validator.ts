export function validateUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error(`Invalid URL format: ${urlString}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Invalid protocol: ${url.protocol}. Only http and https are allowed.`);
  }

  const hostname = url.hostname;
  
  // Prevent SSRF by checking for common private / local IPs
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    (hostname.startsWith("172.") && 
      parseInt(hostname.split(".")[1]) >= 16 && 
      parseInt(hostname.split(".")[1]) <= 31)
  ) {
    throw new Error(`Security Exception: Local and private IP addresses are not allowed.`);
  }

  return url;
}
