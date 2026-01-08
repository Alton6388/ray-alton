"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Link from "next/link";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const addr = window.crossmark?.session?.address || localStorage.getItem('walletAddress') || null;
    setAddress(addr);
    if (!addr) return;

    fetch(`/api/purchases`, { headers: { 'x-wallet-address': addr } })
      .then((r) => r.json())
      .then((data) => setPurchases(data))
      .catch(console.error);
  }, []);

  const handleDownload = async (purchaseId: string) => {
    if (!address) return alert('Connect your wallet first');
    // Open download in new tab (send header via fetch then blob) because we need to include header
    try {
      const res = await fetch(`/api/download?id=${purchaseId}`, { headers: { 'x-wallet-address': address } });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ebook.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Purchases</h1>

          {!address && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-900">Connect your wallet to view purchases.</p>
            </div>
          )}

          {purchases.length === 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600">No purchases found.</p>
              <p className="text-xs text-gray-400 mt-2">Visit the marketplace to buy e-books.</p>
            </div>
          )}

          <div className="space-y-4">
            {purchases.map((p) => (
              <div key={p.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Product ID: {p.productId}</div>
                  <div className="text-xs text-gray-500">Purchase ID: {p.id}</div>
                  <div className="text-xs text-gray-500">Tx: {p.txHash || '—'}</div>
                </div>
                <div>
                  {p.pdfPath ? (
                    <button onClick={() => handleDownload(p.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Download PDF</button>
                  ) : (
                    <span className="text-sm text-gray-500">No PDF available</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/" className="text-sm text-blue-600">Back to Marketplace</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
