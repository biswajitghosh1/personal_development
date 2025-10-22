import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState({ ticker: '', quantity: '', buy_price: '' });

  const fetchStocks = async () => {
    const res = await axios.get('http://localhost:5000/stocks');
    const updatedStocks = await Promise.all(res.data.map(async stock => {
      const priceRes = await axios.get(`http://localhost:5000/stock-price/${stock.ticker}`);
      const livePrice = priceRes.data.price;
      const gainLoss = ((livePrice - stock.buy_price) * stock.quantity).toFixed(2);
      return { ...stock, livePrice, gainLoss };
    }));
    setStocks(updatedStocks);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/stocks', form);
    setForm({ ticker: '', quantity: '', buy_price: '' });
    fetchStocks();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/stocks/${id}`);
    fetchStocks();
  };

  return (
    <div>
      <h1>Stock Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })} />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <input placeholder="Buy Price" type="number" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
        <button type="submit">Add Stock</button>
      </form>
      <ul>
        {stocks.map(stock => (
          <li key={stock.id}>
            {stock.ticker} - Qty: {stock.quantity} - Buy: ₹{stock.buy_price} - Live: ₹{stock.livePrice} - Gain/Loss: ₹{stock.gainLoss}
            <button onClick={() => handleDelete(stock.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;