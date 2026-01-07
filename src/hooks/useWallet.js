import { useState } from 'react';
import { Client } from 'xrpl';

export function useWallet() {
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ xrp: '0', rlusd: '0' });

  const connect = async () => {
    try {
      if (typeof window.crossmark === 'undefined') {
        alert('Please install Crossmark: https://crossmark.io');
        return;
      }

      const result = await window.crossmark.connect();
      
      if (result?.response?.data?.address) {
        const userAddress = result.response.data.address;
        setAddress(userAddress);
        setIsConnected(true);
        await fetchBalance(userAddress);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const fetchBalance = async (addr) => {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    
    try {
      await client.connect();

      const accountInfo = await client.request({
        command: 'account_info',
        account: addr,
        ledger_index: 'validated'
      });
      
      const xrpBalance = (accountInfo.result.account_data.Balance / 1000000).toFixed(2);

      const trustlines = await client.request({
        command: 'account_lines',
        account: addr,
        ledger_index: 'validated'
      });

      const rlusdLine = trustlines.result.lines.find(line => line.currency === 'USD');
      const rlusdBalance = rlusdLine ? parseFloat(rlusdLine.balance).toFixed(2) : '0';

      setBalance({ xrp: xrpBalance, rlusd: rlusdBalance });
      
    } catch (error) {
      console.error('Balance fetch error:', error);
    } finally {
      await client.disconnect();
    }
  };

  const disconnect = () => {
    setAddress('');
    setIsConnected(false);
    setBalance({ xrp: '0', rlusd: '0' });
  };

  return {
    address,
    isConnected,
    balance,
    connect,
    disconnect,
    refreshBalance: () => address && fetchBalance(address)
  };
}