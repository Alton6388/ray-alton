'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [escrows, setEscrows] = useState([]);
  const [crossmarkDetected, setCrossmarkDetected] = useState(false);

  // Check for Crossmark on component mount - FIXED VERSION
  useEffect(() => {
    console.log('🔍 Component mounted, checking for Crossmark...');
    console.log('Initial window.crossmark:', window.crossmark);
    
    // Immediate check - just check if crossmark object exists
    const checkNow = () => {
      // More lenient check - just check if crossmark object exists
      const hasCrossmark = typeof window !== 'undefined' && 
                          window.crossmark && 
                          typeof window.crossmark === 'object';
      
      console.log('Crossmark check:', {
        hasCrossmark,
        windowCrossmarkExists: !!window.crossmark,
        crossmarkType: typeof window.crossmark,
        crossmarkKeys: window.crossmark ? Object.keys(window.crossmark) : [],
        methodsAvailable: window.crossmark ? Object.keys(window.crossmark).filter(k => typeof window.crossmark[k] === 'function') : []
      });
      
      setCrossmarkDetected(hasCrossmark);
      return hasCrossmark;
    };
    
    // Check immediately
    if (checkNow()) {
      console.log('✅ Crossmark found immediately!');
      return;
    }
    
    // If not found, set up a persistent checker
    console.log('⏳ Crossmark not found immediately, setting up interval checker...');
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      console.log(`Attempt ${attempts}: Checking for Crossmark...`);
      if (checkNow()) {
        console.log(`✅ Crossmark detected after ${attempts} attempts!`);
        clearInterval(interval);
      }
    }, 300); // Check every 300ms
    
    // Stop after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('⏱️ Stopped checking after 30 seconds');
    }, 30000);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Manual check function
  const checkCrossmark = async () => {
    console.log('=== MANUAL CROSSMARK CHECK ===');
    console.log('Window object:', typeof window);
    console.log('Window.crossmark exists:', !!window.crossmark);
    console.log('Window.crossmark type:', typeof window.crossmark);
    console.log('Window.crossmark keys:', window.crossmark ? Object.keys(window.crossmark) : 'N/A');
    console.log('Window.crossmark.connect exists:', !!(window.crossmark && window.crossmark.connect));
    console.log('Window.crossmark.connect type:', window.crossmark ? typeof window.crossmark.connect : 'N/A');
    console.log('All window properties containing "cross":', Object.keys(window).filter(key => key.toLowerCase().includes('cross')));
    console.log('==============================');
    
    if (typeof window !== 'undefined' && window.crossmark?.connect) {
      setCrossmarkDetected(true);
      alert('✅ Crossmark detected successfully!');
      
      // Try to test the connection
      try {
        const result = await window.crossmark.connect();
        console.log('Connection test result:', result);
      } catch (error) {
        console.log('Connection test failed:', error);
      }
    } else {
      setCrossmarkDetected(false);
      alert('❌ Crossmark not found. Check browser console for detailed analysis.\n\nMake sure:\n1. Crossmark extension is installed\n2. You\'re on HTTP/HTTPS (not file://)\n3. Extension is enabled\n4. Try refreshing the page');
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Check if Crossmark object exists
      if (!window.crossmark) {
        throw new Error('Crossmark extension not detected. Please install Crossmark and refresh the page.');
      }

      console.log('========== CROSSMARK CONNECTION ATTEMPT ==========');
      console.log('1. Crossmark object:', window.crossmark);
      console.log('2. Available keys:', Object.keys(window.crossmark));
      console.log('3. All properties and their types:');
      Object.keys(window.crossmark).forEach(key => {
        console.log(`   - ${key}: ${typeof window.crossmark[key]}`);
      });
      
      // Step 1: Try to find the right connection method
      console.log('4. Looking for connection methods...');
      
      let address;
      
      // Since connect() doesn't exist, maybe the API is event-based or session-based
      // Let's check session first
      if (window.crossmark.session) {
        console.log('→ Found session object:', window.crossmark.session);
        if (window.crossmark.session.address) {
          address = window.crossmark.session.address;
          console.log('✅ Found address in session:', address);
        } else if (window.crossmark.session.account) {
          address = window.crossmark.session.account;
          console.log('✅ Found address in session.account:', address);
        }
      }
      
      // Check api object
      if (!address && window.crossmark.api) {
        console.log('→ Checking api object:', window.crossmark.api);
        console.log('→ API keys:', Object.keys(window.crossmark.api));
        
        // Try calling v1.some.signInAndWait or similar
        if (window.crossmark.api.v1) {
          console.log('→ Found api.v1:', Object.keys(window.crossmark.api.v1));
          
          if (typeof window.crossmark.api.v1.signInAndWait === 'function') {
            console.log('→ Calling api.v1.signInAndWait()...');
            const result = await window.crossmark.api.v1.signInAndWait();
            console.log('→ signInAndWait result:', result);
            address = result?.address || result?.response?.data?.address;
          }
        }
        
        if (!address && typeof window.crossmark.api.signIn === 'function') {
          console.log('→ Calling api.signIn()...');
          const result = await window.crossmark.api.signIn();
          console.log('→ signIn result:', result);
          address = result?.address || result?.response?.data?.address;
        }
      }
      
      // Check methods object
      if (!address && window.crossmark.methods) {
        console.log('→ Checking methods object');
        console.log('→ Methods keys:', Object.keys(window.crossmark.methods));
        
        // Try each method that sounds like it gets user info
        const methodsToTry = ['signIn', 'connect', 'getAddress', 'getAccount', 'signInAndWait'];
        for (const methodName of methodsToTry) {
          if (typeof window.crossmark.methods[methodName] === 'function') {
            console.log(`→ Trying methods.${methodName}()...`);
            try {
              const result = await window.crossmark.methods[methodName]();
              console.log(`→ ${methodName} result:`, result);
              if (result?.address) {
                address = result.address;
                break;
              } else if (result?.response?.data?.address) {
                address = result.response.data.address;
                break;
              } else if (typeof result === 'string' && result.startsWith('r')) {
                address = result;
                break;
              }
            } catch (err) {
              console.log(`→ ${methodName} failed:`, err.message);
            }
          }
        }
      }
      
      // Last resort: check all properties for anything that looks like an address
      if (!address) {
        console.log('→ Searching all properties for address...');
        for (const key of Object.keys(window.crossmark)) {
          const value = window.crossmark[key];
          console.log(`  Checking ${key}:`, value);
          
          if (typeof value === 'string' && value.startsWith('r') && value.length > 20 && value.length < 40) {
            console.log(`→ Found potential address in crossmark.${key}: ${value}`);
            address = value;
            break;
          }
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (value.address) {
              console.log(`→ Found address in crossmark.${key}.address`);
              address = value.address;
              break;
            }
            if (value.account) {
              console.log(`→ Found address in crossmark.${key}.account`);
              address = value.account;
              break;
            }
          }
        }
      }
      
      if (!address) {
        console.error('❌ Could not find address anywhere in Crossmark object');
        console.log('Full Crossmark structure:', JSON.stringify(window.crossmark, null, 2));
        throw new Error('Crossmark is installed but no wallet address found. Please:\n1. Open Crossmark extension\n2. Make sure you have a wallet created/imported\n3. Ensure the wallet is unlocked\n4. Try refreshing this page');
      }
      
      console.log('🎉 Successfully extracted address:', address);
      console.log('==================================================');

      setWalletAddress(address);
      setIsConnected(true);
      setCrossmarkDetected(true);
      alert('✅ Wallet connected successfully!\n\nAddress: ' + address);
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMsg = error.message;
      if (error.message.includes('User declined') || error.message.includes('User cancelled')) {
        errorMsg = 'Connection cancelled by user';
      }
      
      alert('❌ Connection failed: ' + errorMsg + '\n\nCheck browser console (Cmd+Option+J) for detailed logs.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setEscrows([]);
  };

  const createEscrow = () => {
    if (!isConnected) {
      alert('Connect wallet first!');
      return;
    }

    const newEscrow = {
      id: `escrow_${Date.now()}`,
      amount: '10.00',
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };

    setEscrows(prev => [...prev, newEscrow]);
    alert('✅ Test escrow created!');
  };

  const completeEscrow = (id) => {
    setEscrows(prev => 
      prev.map(escrow => 
        escrow.id === id ? { ...escrow, status: 'completed' } : escrow
      )
    );
  };

  const cancelEscrow = (id) => {
    setEscrows(prev => 
      prev.map(escrow => 
        escrow.id === id ? { ...escrow, status: 'cancelled' } : escrow
      )
    );
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        color: '#667eea', 
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        🧪 Wallet & Escrow Integration Test
      </h1>
      
      {/* Connection Status */}
      <div style={{
        background: isConnected ? '#d1fae5' : '#fee2e2',
        border: `2px solid ${isConnected ? '#10b981' : '#ef4444'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: isConnected ? '#065f46' : '#7f1d1d'
        }}>
          {isConnected ? '🟢 Wallet Connected' : '🔴 Wallet Not Connected'}
        </div>
        {isConnected && (
          <div style={{ marginTop: '8px', color: '#065f46' }}>
            <strong>Address:</strong> <code>{walletAddress}</code>
          </div>
        )}
      </div>

      {/* Wallet Section */}
      <div style={{
        background: '#f9fafb',
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '2px dashed #d1d5db'
      }}>
        <h2 style={{ margin: '0 0 16px 0' }}>💼 Wallet Connection</h2>
        
        {!isConnected ? (
          <button 
            onClick={connectWallet}
            disabled={loading}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Connecting...' : '🦊 Connect Crossmark'}
          </button>
        ) : (
          <button 
            onClick={disconnect}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔌 Disconnect
          </button>
        )}
      </div>

      {/* Escrow Section */}
      <div style={{
        background: '#f9fafb',
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '2px dashed #d1d5db'
      }}>
        <h2 style={{ margin: '0 0 16px 0' }}>🔒 Escrow Management</h2>
        
        <button 
          onClick={createEscrow}
          disabled={!isConnected}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: !isConnected ? '#d1d5db' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          ✨ Create Test Escrow
        </button>

        <div>
          <h3>Escrows ({escrows.length})</h3>
          
          {escrows.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>
              No escrows yet. Create one to test!
            </p>
          ) : (
            escrows.map(escrow => (
              <div 
                key={escrow.id}
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  margin: '12px 0',
                  background: 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {escrow.status === 'pending' ? '⏳' : 
                       escrow.status === 'completed' ? '✅' : '❌'} 
                      {' '}{escrow.amount} RLUSD
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                      {escrow.createdAt} • Status: {escrow.status}
                    </div>
                  </div>
                  
                  {escrow.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => completeEscrow(escrow.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => cancelEscrow(escrow.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug Section */}
      <div style={{
        background: '#fef3f2',
        padding: '24px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '2px dashed #fca5a5'
      }}>
        <h2 style={{ margin: '0 0 16px 0' }}>🔧 Status</h2>
        <p><strong>Crossmark Detected:</strong> {crossmarkDetected ? '✅' : '❌'}</p>
        <p><strong>Connection Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        <p><strong>Next.js Version:</strong> 15.5.9</p>
        
        <button
          onClick={checkCrossmark}
          style={{
            padding: '8px 16px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          🔍 Check Crossmark Now
        </button>
        
        {!crossmarkDetected && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Crossmark Not Detected</p>
            <p style={{ margin: '4px 0 0 0' }}>
              1. Make sure Crossmark extension is installed<br/>
              2. Refresh the page (Cmd+R)<br/>
              3. Check if Crossmark is enabled in browser extensions<br/>
              4. Try restarting your browser
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
