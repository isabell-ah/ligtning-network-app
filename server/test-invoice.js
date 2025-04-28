const { createInvoice } = require('./invoice');

async function test() {
  try {
    const invoice = await createInvoice(900);
    console.log('Created invoice:', invoice);
  } catch (error) {
    console.error('Error:', error);
  }
}
ss;
test();
