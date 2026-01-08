"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Lock, CheckCircle, ShoppingBag } from "lucide-react";

interface Purchase {
  id: string;
  productId: string;
  buyer: string;
  txHash: string;
  pdfPath: string;
  escrowFinished: boolean;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string;
    price: number;
  };
}

export default function MyPurchasesPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWallet = () => {
      const stored = localStorage.getItem('walletAddress');
      setWalletAddress(stored);
      if (stored) {
        loadPurchases(stored);
      } else {
        setLoading(false);
      }
    };
    
    checkWallet();
    
    const handleStorage = () => checkWallet();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(checkWallet, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const loadPurchases = async (address: string) => {
    try {
      // Fetch purchases for this wallet
      const purchasesRes = await fetch(`/api/purchases?address=${address}`);
      if (!purchasesRes.ok) throw new Error('Failed to load purchases');
      const purchasesData = await purchasesRes.json();
      
      // Fetch all products to get details
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      
      // Merge product info into purchases
      const purchasesWithProducts = purchasesData.map((p: Purchase) => ({
        ...p,
        product: productsData.find((prod: any) => prod.id === p.productId)
      }));
      
      setPurchases(purchasesWithProducts);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchase: Purchase) => {
    if (!purchase.escrowFinished) {
      alert(
        '⚠️ Escrow Not Complete\n\n' +
        'Please complete the escrow payment first before downloading.\n\n' +
        'Go to "Finish Escrow" page to release the payment and unlock your PDF.'
      );
      return;
    }

    if (!purchase.pdfPath) {
      alert('❌ No PDF file associated with this purchase.');
      return;
    }

    try {
      const res = await fetch(`/api/download?id=${purchase.id}`, {
        headers: { 'x-wallet-address': walletAddress! }
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Download failed');
      }
      
      // Create download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${purchase.product?.title || 'ebook'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      alert(`❌ Download failed: ${err.message}`);
    }
  };

  // Show wallet required message if not connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />

        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Wallet Connection Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your Crossmark wallet to view your purchased e-books.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900">
                  <strong>How to connect:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                  <li>Click "Connect Wallet" in the header</li>
                  <li>Approve the connection in Crossmark</li>
                  <li>Your purchases will appear here</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />

      {/* Back Button */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
            <p className="text-gray-600">
              View and download your purchased e-books. Connected as: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your purchases...</p>
            </div>
          ) : purchases.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchases Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any e-books yet. Browse our marketplace to find great content!
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <span>Browse Marketplace</span>
              </Link>
            </div>
          ) : (
            // Purchases List
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Cover Image */}
                      {purchase.product?.coverImageUrl ? (
                        <img
                          src={purchase.product.coverImageUrl}
                          alt={purchase.product.title}
                          className="w-16 h-20 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Book Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {purchase.product?.title || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          by {purchase.product?.author || 'Unknown Author'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Purchased: {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                          {purchase.escrowFinished ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Escrow Complete - Ready to Download
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Awaiting Escrow Release
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => handleDownload(purchase)}
                        disabled={!purchase.escrowFinished}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          purchase.escrowFinished
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                      
                      {!purchase.escrowFinished && (
                        <Link
                          href="/escrow"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Complete Escrow →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Transaction Info */}
                  {purchase.txHash && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Transaction:{' '}
                        <a
                          href={`https://testnet.xrpl.org/transactions/${purchase.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {purchase.txHash.slice(0, 16)}...{purchase.txHash.slice(-8)}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Download locked?</strong> Complete the escrow payment on the "Finish Escrow" page first.</li>
              <li>• <strong>Missing purchase?</strong> Make sure you're connected with the same wallet used for purchase.</li>
              <li>• <strong>PDF not downloading?</strong> Check that the seller uploaded a valid PDF file.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
