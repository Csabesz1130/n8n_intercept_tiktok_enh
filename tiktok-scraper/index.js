const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required.' });
  }

  try {
    // In a real implementation, you would use a TikTok scraping library.
    // For this example, we'll return mock data.
    const mockData = [
      { id: '1', text: `This is a TikTok about ${keyword}` },
      { id: '2', text: `Another great TikTok on ${keyword}` },
    ];

    res.json({ data: mockData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape TikTok.' });
  }
});

app.listen(port, () => {
  console.log(`TikTok scraper listening at http://localhost:${port}`);
});
