const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let stocks = [];
let idCounter = 1;

// Get all stocks
app.get('/stocks', (req, res) => {
    res.json(stocks);
});

// Add a new stock
app.post('/stocks', (req, res) => {
    const stock = { id: idCounter++, ...req.body };
    stocks.push(stock);
    res.json(stock);
});

// Edit a stock
app.put('/stocks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    stocks = stocks.map(stock => stock.id === id ? { ...stock, ...req.body } : stock);
    res.json({ success: true });
});

// Delete a stock
app.delete('/stocks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    stocks = stocks.filter(stock => stock.id !== id);
    res.json({ success: true });
});

// Get live stock price
app.get('/stock-price/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    try {
        const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.NS`);
        const price = response.data.quoteResponse.result[0]?.regularMarketPrice;
        res.json({ ticker, price });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));