import fs from 'fs';

const productionSettings = {
  address: 'node.int-t.com'
};

const developSettings = {
  address: 'localhost'
};

const production = (process.argv[2] != 'debug');
const settings = production ? productionSettings : developSettings;

if (production)
  settings.sslCert = {
    key: fs.readFileSync('/etc/letsencrypt/live/node.int-t.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/node.int-t.com/fullchain.pem')
  };


export default {
  production,
  settings
};



