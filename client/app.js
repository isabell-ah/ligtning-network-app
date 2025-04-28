document.getElementById('pay-button').onclick = async () => {
    const amount = document.getElementById('amount').value;
    if (!amount) return alert("Enter an amount!");

    const res = await fetch('http://localhost:3000/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });

    const invoice = await res.json();
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=lightning:${invoice.payment_request}`;

    document.getElementById('qrcode').innerHTML = `<img src="${qrURL}" alt="Invoice QR Code">`;
};
