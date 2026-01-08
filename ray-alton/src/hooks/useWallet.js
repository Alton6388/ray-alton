import { useState } from 'react';
import { Client } from 'xrpl';

export function useWallet() {
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ xrp: '0', rlusd: '0' });
  const [account, setAccount] = useState(null);

  const connect = async () => {
    try {
      if (typeof window.crossmark === 'undefined') {
        alert('Please install Crossmark: https://crossmark.io');
        return;
      }

      const result = await window.crossmark.connect();
      
      if (result?.response?.data?.address) {
        const userAddress = result.response.data.address;
        
        // Link wallet to account via nonce + verify flow
        try {
          // 1. Request nonce from backend
          const nonceRes = await fetch('/api/auth?action=nonce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: userAddress }),
          });
          if (!nonceRes.ok) throw new Error('Nonce request failed');
          const { nonce } = await nonceRes.json();

          // 2. Verify nonce (dev flow: just send nonce back; production would sign it)
          const verifyRes = await fetch('/api/auth?action=verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: userAddress, nonce }),
          });
          if (!verifyRes.ok) throw new Error('Verification failed');
          const { account: linkedAccount } = await verifyRes.json();

          setAccount(linkedAccount);
          console.log('✅ Account linked:', linkedAccount);
        } catch (accountErr) {
          console.warn('Account linking failed (non-critical):', accountErr);
        }

        setAddress(userAddress);
        setIsConnected(true);
        localStorage.setItem('walletAddress', userAddress);
        if (account?.id) localStorage.setItem('accountId', account.id);
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
    setAccount(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('accountId');
  };

  return {
    address,
    isConnected,
    balance,
    account,
    connect,
    disconnect,
    refreshBalance: () => address && fetchBalance(address)
  };
}