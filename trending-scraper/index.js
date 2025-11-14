require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const cheerio = require('cheerio');

// Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/trending-topics';
const SCRAPE_INTERVAL = process.env.SCRAPE_INTERVAL || '0 */6 * * *'; // Every 6 hours

// Google Trends scraper (simplified - in production use official API)
async function scrapeGoogleTrends(region = 'HU') {
  try {
    // Note: This is a simplified example. In production, use Google Trends API or puppeteer
    const url = `https://trends.google.com/trends/api/dailytrends?geo=${region}&hl=hu`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Google Trends returns JSONP, need to parse it
    const jsonData = response.data.replace(/^\)\]\}\'\n/, '');
    const trends = JSON.parse(jsonData);

    const topics = [];
    if (trends.default?.trendingSearchesDays) {
      for (const day of trends.default.trendingSearchesDays) {
        if (day.trendingSearches) {
          for (const search of day.trendingSearches) {
            topics.push({
              keyword: search.title?.query || search.title?.exploreQuery,
              traffic: search.formattedTraffic || 'N/A',
              articles: search.articles?.length || 0,
              source: 'google_trends',
              region,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    return topics.slice(0, 20); // Top 20
  } catch (error) {
    console.error('Error scraping Google Trends:', error.message);
    return [];
  }
}

// Twitter trending scraper (simplified)
async function scrapeTwitterTrends(region = 'Hungary') {
  try {
    // Note: Twitter API v2 requires authentication. This is a simplified example.
    // In production, use Twitter API v2 with proper authentication
    const url = `https://api.twitter.com/1.1/trends/place.json?id=23424844`; // Hungary WOEID
    
    // This would require Twitter API credentials
    // For now, return mock data structure
    return [
      {
        keyword: '#magyarország',
        tweetVolume: 10000,
        source: 'twitter',
        region,
        timestamp: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error('Error scraping Twitter trends:', error.message);
    return [];
  }
}

// GDELT scraper (simplified)
async function scrapeGDELT(region = 'Hungary') {
  try {
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc';
    const params = {
      query: `sourcecountry:${region}`,
      mode: 'artlist',
      maxrecords: 20,
      format: 'json',
    };

    const response = await axios.get(url, { params });
    
    const topics = [];
    if (response.data?.articles) {
      for (const article of response.data.articles.slice(0, 20)) {
        topics.push({
          keyword: article.title || article.seo || 'Untitled',
          url: article.url,
          source: 'gdelt',
          region,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return topics;
  } catch (error) {
    console.error('Error scraping GDELT:', error.message);
    return [];
  }
}

// Aggregate all trending topics
async function aggregateTrendingTopics() {
  console.log('Scraping trending topics...');
  
  const [googleTrends, twitterTrends, gdeltTopics] = await Promise.all([
    scrapeGoogleTrends('HU'),
    scrapeTwitterTrends('Hungary'),
    scrapeGDELT('Hungary'),
  ]);

  // Combine and deduplicate
  const allTopics = [...googleTrends, ...twitterTrends, ...gdeltTopics];
  
  // Deduplicate by keyword
  const uniqueTopics = [];
  const seen = new Set();
  
  for (const topic of allTopics) {
    const key = topic.keyword?.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueTopics.push(topic);
    }
  }

  // Sort by relevance/engagement
  uniqueTopics.sort((a, b) => {
    const aScore = (a.traffic || 0) + (a.tweetVolume || 0) + (a.articles || 0);
    const bScore = (b.traffic || 0) + (b.tweetVolume || 0) + (b.articles || 0);
    return bScore - aScore;
  });

  return uniqueTopics.slice(0, 30); // Top 30
}

// Send trending topics to n8n webhook
async function sendToN8N(topics) {
  try {
    const payload = {
      trendingTopics: topics,
      timestamp: new Date().toISOString(),
      source: 'trending-scraper',
    };

    await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Sent ${topics.length} trending topics to n8n`);
  } catch (error) {
    console.error('Error sending to n8n:', error.message);
  }
}

// Main scraping function
async function scrapeAndSend() {
  try {
    const topics = await aggregateTrendingTopics();
    
    if (topics.length > 0) {
      await sendToN8N(topics);
      console.log(`Successfully processed ${topics.length} trending topics`);
    } else {
      console.log('No trending topics found');
    }
  } catch (error) {
    console.error('Error in scrapeAndSend:', error);
  }
}

// Run immediately on start
scrapeAndSend();

// Schedule periodic scraping
cron.schedule(SCRAPE_INTERVAL, () => {
  console.log('Running scheduled trending topics scrape...');
  scrapeAndSend();
});

console.log('Trending scraper started');
console.log(`Scraping interval: ${SCRAPE_INTERVAL}`);
console.log(`n8n webhook: ${N8N_WEBHOOK_URL}`);

// Keep process alive
process.on('SIGTERM', () => {
  console.log('Shutting down trending scraper...');
  process.exit(0);
});

