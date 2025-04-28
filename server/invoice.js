const lnd = require('./grpc');

// Create Invoice
async function createInvoice(amountSats) {
    return new Promise((resolve, reject) => {
        const request = {
            memo: "Test Invoice",
            value: amountSats
        };
        lnd.AddInvoice(request, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Subscribe to Invoices
function subscribeToInvoices() {
    const call = lnd.SubscribeInvoices({});
    call.on('data', (invoice) => {
        if (invoice.settled) {
            console.log(`Invoice settled! ${invoice.memo}`);
        }
    });
    call.on('error', console.error);
}

module.exports = { createInvoice, subscribeToInvoices };
