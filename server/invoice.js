const lnd = require('./grpc');

// Create Invoice
async function createInvoice(amountSats) {
  try {
    if (!amountSats || amountSats <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }
    // Create invoice request
    const request = {
      value: amountSats.toString(),
      memo: 'Test Invoice',
    };
    console.log('Creating invoice with request:', request);

    // send request to  LND
    const response = await lnd.addInvoice(request);
    const invoice = {
      payment_request: response.payment_request,
      r_hash: Buffer.from(response.r_hash).toString('hex'),
      add_index: response.add_index?.toString(),
      amount: amountSats,
    };
    console.log('Successfully created invoice:', invoice);
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Subscribe to invoice updates
function subscribeToInvoices() {
  const call = lnd.subscribeInvoices({});
  call.on('data', (invoice) => {
    if (invoice.settled) {
      console.log(
        `Invoice settled! ${(invoice.payment_request, invoice.memo)}`
      );
    }
  });
  call.on('Invoice subscription error', console.error);
}

module.exports = { createInvoice, subscribeToInvoices };
