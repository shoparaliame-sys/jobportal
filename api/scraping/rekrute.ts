import * as cheerio from "cheerio";

export async function scrapeRekruteJobs(): Promise<any[]> {
  const targetUrl = "https://www.rekrute.com/offres.html";
  const startTime = Date.now();
  
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  
  const jobs: any[] = [];
  
  $("li.post-id").each((_, element) => {
    const $el = $(element);
    
    // Extract Title and Link
    const $titleLink = $el.find("a.titreJob");
    if ($titleLink.length === 0) return;
    
    const rawTitle = $titleLink.text().trim();
    const href = $titleLink.attr("href");
    if (!href) return;
    const link = href.startsWith("http") ? href : `https://www.rekrute.com${href}`;
    
    // Split title and location "Responsable Transport | Casablanca (Maroc)"
    let title = rawTitle;
    let location = "Maroc";
    if (rawTitle.includes(" | ")) {
      const parts = rawTitle.split(" | ");
      title = parts[0].trim();
      location = parts[1].replace("(Maroc)", "").trim();
    }
    
    // Extract Company (from image alt or fallback)
    const companyAlt = $el.find("img.photo").attr("alt");
    const companyName = companyAlt && companyAlt.trim() ? companyAlt.trim() : "Confidentiel";
    
    // Extract Description
    const description = $el.find(".info span").first().text().trim() || "Aucune description fournie.";
    
    // Extract Date
    const dateText = $el.find("em.date span").first().text().trim(); // "09/06/2026"
    let pubDate = new Date();
    if (dateText && dateText.includes("/")) {
      const [day, month, year] = dateText.split("/");
      pubDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Create consistent ID
    const guid = $el.attr("id") || link;

    jobs.push({
      title,
      link,
      guid,
      company: companyName,
      location,
      pubDate,
      content: description,
    });
  });

  return jobs;
}
