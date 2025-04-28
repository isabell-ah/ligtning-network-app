const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Proto file loading options
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
// Load proto file
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'rpc.proto'),
  options
);

// Load the proto package definition
const lightning = grpc.loadPackageDefinition(packageDefinition);

// Verify the loaded package
if (!lightning.lnrpc || !lightning.lnrpc.Lightning) {
  throw new Error('Failed to load Lightning service from proto file');
}

// Load credentials
const tlsCert = fs.readFileSync(process.env.LND_CERT_PATH);
const sslCreds = grpc.credentials.createSsl(tlsCert);

// Load macaroon
const macaroon = fs.readFileSync(process.env.LND_MACAROON_PATH).toString('hex');
const metadata = new grpc.Metadata();
metadata.add('macaroon', macaroon);

const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_, cb) => {
  cb(null, metadata);
});

// Combine credentials
const credentials = grpc.credentials.combineChannelCredentials(
  sslCreds,
  macaroonCreds
);

// Create LND client
const lnrpcClient = new lightning.lnrpc.Lightning(
  process.env.LND_GRPC_HOST,
  credentials
);

// Wrap the client methods in promises
const lnd = {
  getInfo: () => {
    return new Promise((resolve, reject) => {
      lnrpcClient.getInfo({}, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  },
  addInvoice: (params) => {
    return new Promise((resolve, reject) => {
      lnrpcClient.addInvoice(params, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  },
  subscribeInvoices: (params) => {
    return lnrpcClient.subscribeInvoices(params);
  },
};

// Test connection
lnd
  .getInfo()
  .then((info) => console.log('Connected to LND:', info.alias))
  .catch((err) => console.error('Failed to connect to LND:', err));

module.exports = lnd;
