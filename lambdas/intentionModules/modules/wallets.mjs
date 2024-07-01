import { createBitcoinWallet, createEthereumWallet, createSolanaWallet } from "./createWallet.mjs";
const callTable = {
  get: async function (params) {
    const fMap = {
      bitcoin: (net = 'net') => createBitcoinWallet(net),
      ethereum: createEthereumWallet,
      solana: createSolanaWallet,
    };
    const types = Object.entries(params).filter( ([k,v]) => v).map( ([k,_]) => k);
    const wallets = await Promise.all(
      types.map( bc => fMap[bc]().then( res => ({
          [bc]: {
            public: res.publicKey,
            private: res.secretKey,
            mnemonic: res.mnemonic ?? null,
          }
        })))
    ).then( data => data.reduce((a,b) => ({...a, ...b}), {}));
    return wallets;
  },
}

async function callInterface(interfaceObject, value) {
  const command = value.command;
  if (command == null) throw new Error('command field expected');  
  const func = callTable[command];
  if (func == null) throw new Error(`function ${command} is not implemented`);
  return await func(value.data);
}


export async function create(status, intention, value) {
  if (status == 'accepting') {
    return this.interface;
  }

  if (status == 'data') {
    return await callInterface(this.interface, value)  
  }

  return { message: 'success'};
}

export default {
  create
}