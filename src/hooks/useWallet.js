import { useState } from 'react';
import { Client } from 'xrpl';

export function useWallet() {
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ xrp: '0', rlusd: '0' });

  const connect = async () => {
    try {
      // Wait for Crossmark to be available
      const waitForCrossmark = async (timeout = 10000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          if (typeof window.crossmark !== 'undefined' && window.crossmark.connect) {
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
      };

      if (typeof window.crossmark === 'undefined' || !window.crossmark.connect) {
        console.log('Crossmark not immediately available, waiting...');
        const available = await waitForCrossmark();
        
        if (!available) {
          alert('Crossmark extension not detected. Please install from: https://crossmark.io');
          return;
        }
      }

      console.log('Attempting Crossmark connection...');
      const result = await window.crossmark.connect();
      
      if (result?.response?.data?.address) {
        const userAddress = result.response.data.address;
        setAddress(userAddress);
        setIsConnected(true);
        await fetchBalance(userAddress);
        console.log('Successfully connected to:', userAddress);
      } else {
        throw new Error('No address returned from Crossmark');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed: ' + error.message);
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