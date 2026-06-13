import * as cheerio from 'cheerio';

export async function extractFromURL(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove non-content elements
    $('script, style, nav, header, footer, aside, iframe, noscript, .nav, .header, .footer, .sidebar, .advertisement, .ad, #nav, #header, #footer, #sidebar').remove();
    
    // Try to find main content
    let content = '';
    const mainSelectors = ['article', 'main', '[role="main"]', '.content', '.post-content', '.article-body', '.entry-content'];
    
    for (const selector of mainSelectors) {
      const el = $(selector);
      if (el.length && el.text().trim().length > 100) {
        content = el.text().trim();
        break;
      }
    }
    
    // Fallback: get body text
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    
    const title = $('title').text().trim() || $('h1').first().text().trim() || url;
    
    return { text: content, title };
  } catch (error) {
    throw new Error(`URL extraction failed: ${error.message}`);
  }
}
