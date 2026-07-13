const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  console.log("Fetching https://wisefitorg.com/digest/ ...");
  try {
    const response = await axios.get("https://wisefitorg.com/digest/", {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    });
    const html = response.data;
    console.log("Fetched HTML length:", html.length);

    let lastUpdated = "";
    let targetDateStr = "2026-07-13"; // fallback

    const $ = cheerio.load(html);
    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.startsWith("Updated:")) {
        lastUpdated = text.replace("Updated:", "").trim();
        console.log("Found Updated string:", lastUpdated);
        const match = lastUpdated.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
          targetDateStr = match[1];
        }
      }
    });

    console.log("Detected targetDateStr:", targetDateStr);

    let quotesFromHtml = [];
    const quotesHeader = $("h1, h2, h3").filter((i, el) => {
      const txt = $(el).text().toLowerCase();
      return txt.includes("daily wise quotes") || 
             txt.includes("100 daily quotes") || 
             txt.includes("daily digest") || 
             txt.includes("wise quotes") ||
             txt.includes("daily quotes");
    });

    console.log("Found quotesHeader:", quotesHeader.length, quotesHeader.first().text());

    if (quotesHeader.length > 0) {
      const nextElements = quotesHeader.first().nextAll();
      console.log("Number of nextElements sibling elements:", nextElements.length);
      nextElements.each((i, el) => {
        let text = $(el).text().replace(/\s+/g, ' ').trim();
        console.log(`Element ${i} tag: ${el.name}, text: ${text.substring(0, 60)}`);
        if (text.length > 10) {
          const numMatch = text.match(/^•?\s*\d+\.\s*/);
          if (numMatch) {
            text = text.substring(numMatch[0].length).trim();
          }

          const separators = [" — ", " – ", " - ", "—", "–"];
          let qText = text;
          let qAuthor = "Ancient Wisdom";
          let foundSep = false;
          
          for (const sep of separators) {
            if (text.includes(sep)) {
              const parts = text.split(sep);
              const lastPart = parts[parts.length - 1].trim();
              if (lastPart.length > 1 && lastPart.length < 55) {
                qAuthor = lastPart;
                qText = parts.slice(0, -1).join(sep).trim();
                foundSep = true;
                break;
              }
            }
          }
          
          quotesFromHtml.push({
            text: qText,
            author: qAuthor,
            source: "Daily Digest"
          });
        }
      });
    }

    console.log("Scraped quotes count:", quotesFromHtml.length);
    if (quotesFromHtml.length > 0) {
      console.log("First quote parsed:", quotesFromHtml[0]);
    }

  } catch (err) {
    console.error("Error in test:", err);
  }
}

test();
