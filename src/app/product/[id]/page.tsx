"use client";

import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import ProductDetails from "../../../components/ProductDetails";
import { mockProducts } from "../../../lib/mockProducts";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useCrossmarkReady } from "@/hooks/useCrossmarkReady";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  const product = mockProducts.find((p: any) => p.id === productId);

  // Use the robust Crossmark initialization hook
  const { isReady: crossmarkReady } = useCrossmarkReady();

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBuyNow = async (productId: string, price: number) => {
    console.log(`Buy Now clicked for product ${productId} at ${price} XRP`);
    
    // Check if Crossmark is ready (using robust initialization)
    if (!crossmarkReady || !window.crossmark) {
      alert('⚠️ Crossmark wallet not ready.\n\nPlease wait for the extension to load, or install it from: https://crossmark.io');
      return;
    }

    try {
      // Step 1: Verify Crossmark is ready
      console.log('🔐 Step 1: Verifying Crossmark...');
      
      if (!window.crossmark || typeof window.crossmark !== 'object') {
        alert('❌ Crossmark wallet not detected.\n\nPlease install Crossmark from: https://crossmark.io');
        return;
      }
      
      // Step 2: Get current session info FIRST (before connecting)
      const currentSession = window.crossmark?.session;
      console.log('📋 Current Crossmark session:', currentSession);
      
      // CRITICAL: Check network - must be on Testnet!
      const network = currentSession?.network || 'unknown';
      console.log('🌐 Network detected:', network);
      
      // Check if we're on the wrong network
      if (network && network.toString().toLowerCase().includes('main')) {
        alert(
          '❌ WRONG NETWORK!\n\n' +
          'You are currently on MAINNET.\n' +
          'This marketplace requires TESTNET.\n\n' +
          'To switch to Testnet:\n' +
          '1. Open Crossmark extension\n' +
          '2. Click Settings (gear icon)\n' +
          '3. Click "Network"\n' +
          '4. Select "Testnet"\n' +
          '5. Refresh this page\n\n' +
          'Testnet uses FREE test XRP for testing!'
        );
        return;
      }
      
      // If network is not explicitly testnet, warn user
      if (network && !network.toString().toLowerCase().includes('test')) {
        const confirmContinue = confirm(
          '⚠️ NETWORK WARNING\n\n' +
          `Detected network: ${network}\n\n` +
          'This marketplace is designed for TESTNET.\n' +
          'Are you sure you want to continue?\n\n' +
          'Click OK to continue, or Cancel to stop and switch networks.'
        );
        if (!confirmContinue) {
          return;
        }
      }
      
      // Step 3: Check if we need to connect
      let buyerAddress = null;
      
      // If there's already a session, use it (don't reconnect unnecessarily)
      if (currentSession?.address) {
        buyerAddress = currentSession.address;
        console.log('✅ Using existing session:', buyerAddress);
      }
      // If no session, try to connect
      else {
        console.log('🔌 No active session, attempting connection...');
        
        if (typeof window.crossmark.connect !== 'function') {
          alert(
            '❌ Crossmark connection method not available.\n\n' +
            'Please:\n' +
            '1. Update Crossmark to the latest version\n' +
            '2. Make sure you are logged in\n' +
            '3. Try refreshing this page'
          );
          return;
        }
        
        try {
          // Ask user to connect/approve
          const connectResult = await window.crossmark.connect();
          console.log('✅ Connection result:', connectResult);
          
          // After connecting, get the session again
          const newSession = window.crossmark?.session;
          buyerAddress = newSession?.address || connectResult?.address;
          
          if (buyerAddress) {
            console.log('✅ Successfully connected:', buyerAddress);
            localStorage.setItem('walletAddress', buyerAddress);
          }
        } catch (connectError: any) {
          console.error('❌ Connection failed:', connectError);
          
          if (connectError.message?.includes('rejected') || connectError.message?.includes('cancelled')) {
            alert('❌ Connection cancelled. Please approve the connection to continue.');
            return;
          }
          
          alert(
            '❌ Failed to connect to Crossmark.\n\n' +
            'Error: ' + (connectError.message || 'Unknown error') + '\n\n' +
            'Please try:\n' +
            '1. Open Crossmark extension\n' +
            '2. Make sure you are logged in\n' +
            '3. Switch to TESTNET network\n' +
            '4. Refresh this page and try again'
          );
          return;
        }
      }
      
      // Step 4: Final verification
      if (!buyerAddress) {
        alert(
          '❌ Could not get wallet address.\n\n' +
          'Please:\n' +
          '1. Open Crossmark extension\n' +
          '2. Make sure you are logged in\n' +
          '3. Check you are on TESTNET network\n' +
          '4. Make sure the correct account is selected\n' +
          '5. Refresh this page and try again'
        );
        return;
      }
      
      // Step 5: Verify the address matches Crossmark's current session
      const verifySession = window.crossmark?.session?.address;
      if (verifySession && verifySession !== buyerAddress) {
        console.warn('⚠️ Address mismatch detected!', { buyerAddress, verifySession });
        buyerAddress = verifySession; // Use the session address
      }
      
      console.log('✅ Verified buyer address:', buyerAddress);
      console.log('🔐 Current Crossmark session:', window.crossmark?.session);

      // For testing: Use buyer's address as seller if seller is not activated
      // In production, you would check if the seller address is activated via API call
      const sellerAddress = product.seller || buyerAddress; // Fallback to buyer's address for testing
      
      console.log(`🛒 Creating escrow from ${buyerAddress} to ${sellerAddress}`);
      
      // CRITICAL FIX: Convert to Ripple Epoch time
      // XRPL time starts from January 1, 2000 (not January 1, 1970 like Unix)
      // We need to subtract 946,684,800 seconds (30 years) to convert properly
      const RIPPLE_EPOCH_OFFSET = 946684800; // Seconds between Unix epoch (1970) and Ripple epoch (2000)
      const now = Math.floor(Date.now() / 1000) - RIPPLE_EPOCH_OFFSET;
      const finishAfter = now + (1 * 60); // Funds can be released after 1 minute (for testing)
      const cancelAfter = now + (7 * 86400); // Buyer can cancel after 7 days
      
      // Convert back to Unix timestamp for display
      const finishAfterDate = new Date((finishAfter + RIPPLE_EPOCH_OFFSET) * 1000);
      const cancelAfterDate = new Date((cancelAfter + RIPPLE_EPOCH_OFFSET) * 1000);
      
      console.log(`⏰ FinishAfter: ${finishAfter} (Ripple time) = ${finishAfterDate.toLocaleString()}`);
      console.log(`⏰ CancelAfter: ${cancelAfter} (Ripple time) = ${cancelAfterDate.toLocaleString()}`);
      
      // Determine currency and amount format
      const currency = product.currency || 'XRP';
      let amount: string | object;
      
      console.log(`💰 Product currency: ${currency}, Price: ${price}`);
      
      if (currency === 'XRP') {
        // XRP: convert to drops (1 XRP = 1,000,000 drops)
        // MUST be a string
        const drops = Math.floor(price * 1000000);
        amount = drops.toString();
        console.log(`💵 XRP Amount: ${amount} drops (${price} XRP)`);
      } else if (currency === 'RLUSD') {
        // RLUSD: use issued currency format
        amount = {
          currency: '534D41525400000000000000000000000000000000', // "RLUSD" in hex
          value: price.toString(),
          issuer: 'rLsREnvy59zduBugz9Vzz8UShpNU4kj11D' // RLUSD issuer on testnet
        };
        console.log(`💵 RLUSD Amount:`, amount);
      } else {
        // Default to XRP if currency is unknown
        const drops = Math.floor(price * 1000000);
        amount = drops.toString();
        console.log(`💵 Default to XRP: ${amount} drops`);
      }

      const tx = {
        TransactionType: 'EscrowCreate',
        Account: buyerAddress,
        Amount: amount,
        Destination: sellerAddress,
        FinishAfter: finishAfter,
        CancelAfter: cancelAfter,
        Fee: '12' // Basic fee in drops
      };

      console.log('📝 Creating escrow transaction:', JSON.stringify(tx, null, 2));

      // Try different Crossmark API methods based on what's available
      let signResult;
      
      // Log available methods
      console.log('Available Crossmark methods:', Object.keys(window.crossmark || {}));
      console.log('Available methods.* :', window.crossmark?.methods ? Object.keys(window.crossmark.methods) : 'none');
      console.log('Available async.* :', window.crossmark?.async ? Object.keys(window.crossmark.async) : 'none');
      
      if (typeof window.crossmark.signAndSubmit === 'function') {
        console.log('Using signAndSubmit method');
        signResult = await window.crossmark.signAndSubmit(tx);
      } else if (typeof window.crossmark.sign === 'function') {
        console.log('Using sign method');
        signResult = await window.crossmark.sign(tx);
      } else if (typeof window.crossmark.signTransaction === 'function') {
        console.log('Using signTransaction method');
        signResult = await window.crossmark.signTransaction(tx);
      } else if (window.crossmark.methods?.signAndSubmit) {
        console.log('Using methods.signAndSubmit');
        signResult = await window.crossmark.methods.signAndSubmit(tx);
      } else if (window.crossmark.async?.signAndSubmit) {
        console.log('Using async.signAndSubmit');
        signResult = await window.crossmark.async.signAndSubmit(tx);
      } else {
        // Show available methods to user
        const availableMethods = Object.keys(window.crossmark || {}).join(', ');
        alert(
          `❌ Crossmark signing method not available.\n\n` +
          `Available methods: ${availableMethods}\n\n` +
          `Please update Crossmark to the latest version:\nhttps://crossmark.io`
        );
        return;
      }
      
      console.log('Transaction result:', signResult);

      // Check if transaction was successful (handle different response formats)
      const txHash = 
        signResult?.response?.data?.resp?.result?.hash ||
        signResult?.response?.data?.hash ||
        signResult?.hash ||
        signResult?.id ||
        signResult?.result?.hash;
      
      const txResult = 
        signResult?.response?.data?.resp?.result?.meta?.TransactionResult ||
        signResult?.response?.data?.meta?.TransactionResult ||
        signResult?.meta?.TransactionResult ||
        signResult?.result?.meta?.TransactionResult;
      
      const resultCode =
        signResult?.response?.data?.resp?.result?.engine_result ||
        signResult?.response?.data?.engine_result ||
        signResult?.engine_result ||
        signResult?.result?.engine_result;

      console.log('📊 Transaction Details:', {
        hash: txHash,
        result: txResult,
        resultCode: resultCode,
        fullResponse: signResult
      });

      if (txHash) {
        // Check if transaction failed
        if (txResult && txResult !== 'tesSUCCESS') {
          alert(
            `❌ Transaction Failed!\n\n` +
            `Transaction Hash: ${txHash}\n` +
            `Error Code: ${txResult}\n` +
            `Result: ${resultCode || 'Unknown'}\n\n` +
            `Common causes:\n` +
            `• Insufficient XRP balance (need ${price} + fees)\n` +
            `• Destination wallet not activated\n` +
            `• Invalid escrow parameters\n\n` +
            `View details:\nhttps://testnet.xrpl.org/transactions/${txHash}\n\n` +
            `Check your wallet balance and try again.`
          );
          return;
        }
        
        const successMessage = txResult === 'tesSUCCESS' ? 'Successfully Created!' : 'Submitted!';
        alert(
          `✅ Escrow ${successMessage}\n\n` +
          `Transaction Hash: ${txHash}\n` +
          `Amount: ${price} ${currency}\n` +
          `Seller: ${sellerAddress}\n\n` +
          `⏰ Timing:\n` +
          `• Funds can be released: After 1 minute\n` +
          `• Buyer can cancel: After 7 days\n\n` +
          `The seller can claim funds after 1 minute!\n\n` +
          `View on Explorer:\nhttps://testnet.xrpl.org/transactions/${txHash}`
        );
      } else {
        console.warn('Transaction result:', signResult);
        alert(
          `⚠️ Transaction may have been submitted.\n\n` +
          `Please check your Crossmark wallet history to confirm.\n\n` +
          `If you see a transaction, it was successful!`
        );
      }
      
    } catch (error: any) {
      console.error('❌ Error creating escrow:', error);
      
      const errorMsg = error.message || error.toString() || '';
      
      // Handle specific error types
      if (errorMsg.includes('user rejected') || errorMsg.includes('rejected') || errorMsg.includes('cancelled')) {
        alert('❌ Transaction cancelled by user.');
      } else if (errorMsg.includes('card') || errorMsg.includes('account address') || errorMsg.includes('payload')) {
        alert(
          '❌ Crossmark Session Error\n\n' +
          'Could not verify your wallet connection.\n\n' +
          'Please try:\n' +
          '1. Close Crossmark extension completely\n' +
          '2. Open Crossmark again\n' +
          '3. Make sure you are logged in\n' +
          '4. Switch to your BUYER profile\n' +
          '5. Make sure you are on TESTNET\n' +
          '6. Refresh this page\n' +
          '7. Try purchasing again\n\n' +
          'If problem persists, try logging out and back into Crossmark.'
        );
      } else if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
        alert(
          '❌ Insufficient Balance\n\n' +
          `You need at least ${price + 25} XRP for this transaction.\n\n` +
          'Fund your wallet at:\nhttps://xrpl.org/xrp-testnet-faucet.html'
        );
      } else {
        alert(
          `❌ Transaction failed\n\n` +
          `Error: ${errorMsg}\n\n` +
          `Common solutions:\n` +
          `• Make sure you have enough XRP (need ${price + 25} XRP)\n` +
          `• Verify you're on TESTNET in Crossmark\n` +
          `• Check that you're using the correct wallet\n` +
          `• Try refreshing the page and reconnecting`
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Marketplace</span>
        </button>

        <ProductDetails product={product} onBuyNow={handleBuyNow} />

        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-center space-x-8 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">100%</p>
              <p className="text-sm text-gray-600">Secure</p>
            </div>
            <div className="h-12 w-px bg-green-200"></div>
            <div>
              <p className="text-2xl font-bold text-green-600">7 Days</p>
              <p className="text-sm text-gray-600">Protection</p>
            </div>
            <div className="h-12 w-px bg-green-200"></div>
            <div>
              <p className="text-2xl font-bold text-green-600">Instant</p>
              <p className="text-sm text-gray-600">Delivery</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
