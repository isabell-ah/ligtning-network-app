const express = require('express');
const { createInvoice, subscribeToInvoices } = require('./invoice');
const cors = require('cors');
const lnd = require('./grpc');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// test-connection
app.get('/test-connection', async (req, res) => {
  try {
    const info = await lnd.getInfo();
    res.json(info);
  } catch (err) {
    console.error('Connection test failed:', err);
    res.status(500).json({
      error: 'Failed to connect to LND node',
      details: err.message,
    });
  }
});

// Create Invoice endpoint
app.post('/create-invoice', async (req, res) => {
  console.log('Received request body:', req.body);

  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      details: 'Amount must be a positive number',
    });
  }

  try {
    const invoice = await createInvoice(parseInt(amount));
    res.json(invoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({
      error: 'Error creating invoice',
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);

  // Start invoice subscription with retry mechanism
  try {
    subscribeToInvoices();
  } catch (error) {
    console.error('Failed to start invoice subscription:', error);
  }
});
// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
