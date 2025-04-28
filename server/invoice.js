const lnd = require('./grpc');

// Create Invoice
async function createInvoice(amountSats) {
  try {
    const request = {
      value: amountSats.toString(),
      memo: 'Test Invoice',
    };
    if (!amountSats || amountSats <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    const response = await lnd.addInvoice(request);
    console.log('Creating invoice with request:', request);
    const invoice = {
      payment_request: response.payment_request,
      r_hash: Buffer.from(response.r_hash).toString('hex'),
      add_index: response.add_index?.toString(),
      amount: amountSats,
    };

    console.log('Successfully created invoice:', invoice);
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Subscribe to Invoices
function subscribeToInvoices() {
  try {
    const call = lnd.subscribeInvoices({});

    call.on('data', (invoice) => {
      if (invoice.settled) {
        console.log('Invoice settled!', {
          payment_request: invoice.payment_request,
          value: invoice.value,
          memo: invoice.memo,
        });
      }
    });

    call.on('error', (error) => {
      console.error('Invoice subscription error:', error);
    });

    call.on('end', () => {
      console.log('Invoice subscription ended');
    });
  } catch (error) {
    console.error('Error setting up invoice subscription:', error);
  }
}

module.exports = { createInvoice, subscribeToInvoices };
