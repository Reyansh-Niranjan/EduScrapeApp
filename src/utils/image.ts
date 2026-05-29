export const getOptimizedImageUrl = (url: string, width = 384, quality = 70) => {
  if (!url) return "";

  if (url.startsWith("/") || !/^https?:\/\//i.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const bypassHosts = new Set([
      "avatars.githubusercontent.com",
      "github.com",
      "i.imgur.com",
    ]);
    if (bypassHosts.has(parsed.hostname)) {
      return url;
    }
  } catch {
    return url;
  }

  const proxyBase = "https://images.weserv.nl";
  try {
    const isHttps = /^https:\/\//i.test(url);
    const sanitized = url.replace(/^https?:\/\//i, "");
    const encoded = encodeURI(`${isHttps ? "ssl:" : ""}${sanitized}`);
    const params = [
      `url=${encoded}`,
      `w=${width}`,
      `q=${quality}`,
      "output=webp",
      "fit=cover",
    ];
    return `${proxyBase}/?${params.join("&")}`;
  } catch {
    return url;
  }
};
