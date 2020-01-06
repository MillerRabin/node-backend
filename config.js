const fs = require('fs');

const productionSettings = {
    address: 'node.raintech.su'
};

const developSettings = {
    address: 'localhost'
};

if (exports.production == null)
    exports.production = (process.argv[2] != 'debug');

exports.settings = exports.production ? productionSettings : developSettings;

if (exports.production)
    exports.settings.sslCert = {
        key: fs.readFileSync('/etc/letsencrypt/live/node.raintech.su/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/node.raintech.su/fullchain.pem')
    };

