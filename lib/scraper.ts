import * as cheerio from 'cheerio';

const KEYWORDS = ['careers', 'jobs', 'hiring', 'interview', 'team', 'culture', 'about', 'engineering', 'role', 'opportunity'];

export type CrawledPage = {
  url: string;
  title: string;
  text: string;
  score: number;
};

function normalizeUrl(input: string) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function textFromHtml(html: string) {
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

export async function crawlCompanySite(companyUrl: string): Promise<{ pages: CrawledPage[]; bestPage: CrawledPage | null; companyText: string }> {
  const parsed = normalizeUrl(companyUrl);
  if (!parsed) {
    return { pages: [], bestPage: null, companyText: '' };
  }

  const pages: CrawledPage[] = [];
  const seen = new Set<string>();
  const queue: string[] = [parsed.origin];

  while (queue.length && pages.length < 12) {
    const currentUrl = queue.shift();
    if (!currentUrl || seen.has(currentUrl)) continue;
    seen.add(currentUrl);

    try {
      const response = await fetch(currentUrl, {
        headers: { 'User-Agent': 'TaroScraper/1.0' },
        redirect: 'follow',
      });
      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);
      const pageText = textFromHtml(html);
      const title = $('title').first().text().trim() || parsed.hostname;
      const score = KEYWORDS.reduce((total, keyword) => total + (pageText.toLowerCase().includes(keyword) ? 1 : 0), 0);
      const page: CrawledPage = {
        url: currentUrl,
        title,
        text: pageText.slice(0, 4000),
        score,
      };
      pages.push(page);

      if (page.score > 0 || currentUrl === parsed.origin) {
        const links = $('a[href]')
          .map((_, element) => $(element).attr('href'))
          .get()
          .filter((href): href is string => typeof href === 'string' && href.length > 0)
          .map((href) => {
            try {
              return new URL(href, currentUrl).toString();
            } catch {
              return null;
            }
          })
          .filter((url): url is string => typeof url === 'string' && url.startsWith(parsed.origin));

        for (const link of links) {
          if (!seen.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }
      }
    } catch {
      continue;
    }
  }

  const sortedPages = pages.sort((a, b) => b.score - a.score);
  const bestPage = sortedPages[0] ?? null;
  const companyText = sortedPages.map((page) => `${page.title}: ${page.text}`).join(' ');

  return { pages: sortedPages, bestPage, companyText };
}
