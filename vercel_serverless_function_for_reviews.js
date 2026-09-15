// Vercel Serverless Function for handling reviews and proxying to Google Sheets / Apps Script

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzG6wzBFXaTqULFxDP7M_bnRmkqH_-qdAwrSARS3WGT2cI8i3aa-bxFGodqIlGN8m6I2Q/exec";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const reviewData = req.body;
      
      // Forward request to Google Apps Script Web App server-side
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: typeof reviewData === 'string' ? reviewData : JSON.stringify(reviewData),
      });

      const data = await response.json().catch(() => ({ status: 'success', message: 'Review received successfully' }));
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error proxying review submission:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getReviews`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}