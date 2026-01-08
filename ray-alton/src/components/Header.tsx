"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Wallet } from "lucide-react";
import { useCrossmarkReady } from "@/hooks/useCrossmarkReady";

export default function Header() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Use the robust Crossmark initialization hook
  const { isReady: crossmarkReady, isInstalled, error: crossmarkError } = useCrossmarkReady();

  const connectWallet = async () => {
    if (!crossmarkReady || !window.crossmark) {
      alert('⚠️ Crossmark wallet not detected or not ready!\n\nPlease install the Crossmark extension:\nhttps://crossmark.io\n\nOr wait a moment for it to load.');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('Connecting to Crossmark...');
      console.log('Crossmark object:', window.crossmark);
      console.log('Available methods:', Object.keys(window.crossmark));
      
      let address = null;
      
      // Method 1: Check if address is already available in session
      if (window.crossmark.session?.address) {
        address = window.crossmark.session.address;
        console.log('✅ Address found in session:', address);
      }
      // Method 2: Try calling connect if it exists
      else if (typeof window.crossmark.connect === 'function') {
        const result = await window.crossmark.connect();
        console.log('Connection result:', result);
        
        if (result?.address) {
          address = result.address;
        } else if (result?.response?.data?.address) {
          address = result.response.data.address;
        } else if (window.crossmark.session?.address) {
          address = window.crossmark.session.address;
        }
      }
      // Method 3: Try sign-in methods
      else if (window.crossmark.api?.v1?.signInAndWait) {
        console.log('Trying signInAndWait...');
        const result = await window.crossmark.api.v1.signInAndWait();
        address = result?.address || result?.response?.data?.address;
      }
      else if (window.crossmark.methods?.signInAndWait) {
        console.log('Trying methods.signInAndWait...');
        const result = await window.crossmark.methods.signInAndWait();
        address = result?.address || result?.response?.data?.address;
      }
      // Method 4: Prompt user to manually enter address
      else {
        console.warn('No known connection method found');
        alert('⚠️ Crossmark detected but connection method not recognized.\n\nPlease enter your wallet address manually:');
        address = prompt('Enter your XRPL wallet address (starts with "r"):');
        
        if (address && !address.startsWith('r')) {
          alert('❌ Invalid XRPL address. Must start with "r"');
          address = null;
        }
      }
      
      console.log('Retrieved address:', address);
      
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', address);
        console.log('✅ Wallet connected:', address);
      } else {
        console.warn('Could not retrieve address');
        alert('❌ Could not retrieve wallet address.\n\nPlease check:\n1. Crossmark is unlocked\n2. You have approved the connection\n3. Console for more details');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(`❌ Failed to connect:\n${error.message || 'Unknown error'}\n\nCheck console for details.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  };

  // Restore wallet from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          rAyMarketplace
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link href="/escrow" className="text-gray-600 hover:text-gray-900">
            Finish Escrow
          </Link>
          
          {/* Wallet Connection */}
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting || !crossmarkReady}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
                ${crossmarkReady 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <Wallet className="w-5 h-5" />
              {isConnecting ? 'Connecting...' : crossmarkReady ? 'Connect Wallet' : 'Crossmark Loading...'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-gray-700">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
          
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">0</span>
          </button>
        </nav>
      </div>
      
      {/* Crossmark Detection Banner */}
      {!crossmarkReady && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="container mx-auto text-center">
            <p className="text-sm text-yellow-800">
              {!isInstalled ? (
                <>
                  ⚠️ Crossmark wallet not detected. 
                  <a href="https://crossmark.io" target="_blank" rel="noopener noreferrer" className="ml-1 underline font-semibold hover:text-yellow-900">
                    Install Crossmark
                  </a> to make purchases.
                </>
              ) : (
                <>
                  ⏳ Crossmark extension loading... Please wait.
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {crossmarkError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="container mx-auto text-center">
            <p className="text-sm text-red-800">
              ❌ {crossmarkError}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
