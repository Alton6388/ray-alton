import { Client } from 'xrpl-client';

const networks = {
    RIPPLE_TESTNET: 'wss://s.altnet.rippletest.net:51233',
    XRPL_LABS_TESTNET: 'wss://testnet.xrpl-labs.com',
    RIPPLE_AMM_DEVNET: 'wss://amm.devnet.rippltest.net:51233/',
};

let xrplClient: Client;

export const getXrplClient = () => {
    if (!xrplClient) {
        xrplClient = new Client(networks.RIPPLE_TESTNET);
        return xrplClient;
    }
    return xrplClient;
}