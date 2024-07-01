import { Keypair } from '@solana/web3.js';
import Web3 from 'web3';
import { BIP32Factory } from 'bip32';
import bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

const btcPathMap = new Map()
  .set(bitcoin.networks.testnet, `m/44'/1'/0'/0`)
  .set(bitcoin.networks.bitcoin, `m/44'/0'/0'/0`);

export const createBitcoinWallet = async (networkType = 'testnet') => {
  const mnemonic = bip39.generateMnemonic();
  return restoreBtcWalletFromMnemonic(mnemonic, networkType);
}

export const restoreBtcWalletFromMnemonic = async (mnemonic, networkType = 'testnet') => {
  const network = networkType === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  const path = btcPathMap.get(network);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed, network);
  const account = root.derivePath(path);
  const node = account.derive(0).derive(0);
  const btcAddress = bitcoin.payments.p2wpkh({
    pubkey: node.publicKey,
    network,
  }).address;
  return ({
    publicKey: btcAddress,
    secretKey: node.toWIF(),
    mnemonic,
  });

}

export const createSolanaWallet = async () => {
  const mnemonic = bip39.generateMnemonic();
  return restoreSolanaWalletFromMnemonic(mnemonic);
}

export const restoreSolanaWalletFromMnemonic = (mnemonic, password = '') => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, password);
  const account = Keypair.fromSeed(seed.slice(0,32));
  return {
    publicKey: account.publicKey.toBase58(),
    secretKey: account.secretKey,
    mnemonic,
  };
}

export const createEthereumWallet = async () => {
  try {
    const web3 = new Web3(Web3.givenProvider);
    const wallet = web3.eth.accounts.create();
    return {
      publicKey: wallet.address,
      secretKey: wallet.privateKey,
      mnemonic: null,
    }
  } catch (e) {
    console.error(e);
    throw { message: e.message };
  }
}