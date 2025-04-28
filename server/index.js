const express = require('express');
const { createInvoice, subscribeToInvoices } = require('./invoice');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Create Invoice endpoint
app.post('/create-invoice', async (req, res) => {
    const { amount } = req.body;
    try {
        const invoice = await createInvoice(amount);
        res.json(invoice);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating invoice');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    subscribeToInvoices(); // start payment listener
});
