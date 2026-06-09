import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ['company', 'location', 'salary'],
  }
});

// Basic hash function for a string
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function generateJobSlug(externalId: string | undefined, url: string | undefined, title: string, company: string, pubDate: string | Date | undefined) {
  // priority: external job id -> source url -> title + company + publish date
  const priorityString = externalId || url || `${title}-${company}-${pubDate || new Date().toISOString()}`;
  const uniqueHash = hashCode(priorityString);
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 100);
  return `${base}-${uniqueHash}`;
}

export async function parseFeedXml(xml: string) {
  return await parser.parseString(xml);
}
