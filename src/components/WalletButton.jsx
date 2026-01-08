import React from 'react';
import { useWallet } from '../hooks/useWallet';

export function WalletButton() {
  const { address, isConnected, balance, connect, disconnect } = useWallet();

  if (isConnected) {
    return (
      <div style={styles.connected}>
        <div style={styles.balance}>
          <strong> {balance.rlusd} RLUSD</strong>
          <small>({balance.xrp} XRP)</small>
        </div>
        <code style={styles.address}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </code>
        <button onClick={disconnect} style={styles.disconnectBtn}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} style={styles.connectBtn}>
       Connect Wallet
    </button>
  );
}

const styles = {
  connected: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '2px solid #3b82f6'
  },
  balance: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  address: {
    fontSize: '13px',
    color: '#64748b'
  },
  disconnectBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  connectBtn: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  }
};