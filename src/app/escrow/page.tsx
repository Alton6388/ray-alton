"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useCrossmarkReady } from "@/hooks/useCrossmarkReady";

export default function EscrowManagementPage() {
  const router = useRouter();
  const [ownerAddress, setOwnerAddress] = useState("");
  const [offerSequence, setOfferSequence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  // Use the robust Crossmark initialization hook
  const { isReady: crossmarkReady, isInstalled, error: crossmarkError } = useCrossmarkReady();

  const handleFinishEscrow = async () => {
    if (!ownerAddress || !offerSequence) {
      alert("❌ Please enter both Owner Address and Offer Sequence Number");
      return;
    }

    // Check if Crossmark is available
    if (!window.crossmark) {
      alert("❌ Crossmark wallet not detected.\n\nPlease install Crossmark from: https://crossmark.io");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get current session
      const session = window.crossmark?.session;
      let buyerAddress = session?.address;

      // If no session, connect
      if (!buyerAddress) {
        if (window.crossmark?.connect) {
          const connectResult = await window.crossmark.connect();
          buyerAddress = connectResult?.address || window.crossmark?.session?.address;
        }
      }

      if (!buyerAddress) {
        alert("❌ Could not connect to wallet. Please try again.");
        setLoading(false);
        return;
      }

      console.log("🔓 Finishing escrow...");
      console.log("Owner (Buyer):", ownerAddress);
      console.log("Offer Sequence:", offerSequence);
      console.log("Finishing by:", buyerAddress);

      // Create EscrowFinish transaction
      const tx = {
        TransactionType: "EscrowFinish",
        Account: buyerAddress, // Can be buyer or seller
        Owner: ownerAddress, // The address that created the escrow (buyer)
        OfferSequence: parseInt(offerSequence),
        Fee: "12",
      };

      console.log("📝 EscrowFinish transaction:", JSON.stringify(tx, null, 2));

      // Sign and submit
      let signResult;
      if (typeof window.crossmark.signAndSubmit === "function") {
        signResult = await window.crossmark.signAndSubmit(tx);
      } else if (window.crossmark.methods?.signAndSubmit) {
        signResult = await window.crossmark.methods.signAndSubmit(tx);
      } else if (window.crossmark.async?.signAndSubmit) {
        signResult = await window.crossmark.async.signAndSubmit(tx);
      } else {
        alert("❌ Crossmark signing method not available.");
        setLoading(false);
        return;
      }

      console.log("✅ Transaction result:", signResult);

      // Extract transaction hash
      const txHash =
        signResult?.response?.data?.resp?.result?.hash ||
        signResult?.response?.data?.hash ||
        signResult?.hash ||
        signResult?.id ||
        signResult?.result?.hash;

      const txResult =
        signResult?.response?.data?.resp?.result?.meta?.TransactionResult ||
        signResult?.response?.data?.meta?.TransactionResult ||
        (signResult as any)?.meta?.TransactionResult ||
        signResult?.result?.meta?.TransactionResult;

      if (txHash && txResult === "tesSUCCESS") {
        setResult({
          success: true,
          message: "Escrow finished successfully! Funds released to seller.",
          txHash: txHash,
        });
      } else {
        setResult({
          success: false,
          message: `Transaction failed: ${txResult || "Unknown error"}`,
          txHash: txHash,
        });
      }
    } catch (error: any) {
      console.error("❌ Error finishing escrow:", error);
      setResult({
        success: false,
        message: error.message || "Failed to finish escrow",
      });
    } finally {
      setLoading(false);
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

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Finish Escrow</h1>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📋 What does this do?</strong>
                <br />
                When you confirm you've received a product, this releases the funds from escrow to the seller.
                After 1 minute has passed since purchase, either the buyer or seller can finish the escrow.
              </p>
            </div>

            {/* Crossmark Status Indicator */}
            {!crossmarkReady && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">
                    Waiting for Crossmark Extension...
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    {!isInstalled ? 
                      "Crossmark extension not detected. Please install it from crossmark.io" :
                      "Extension loading, please wait..."
                    }
                  </p>
                </div>
              </div>
            )}

            {crossmarkError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Crossmark Error</p>
                  <p className="text-xs text-red-800 mt-1">{crossmarkError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Address (Buyer who created escrow)
                </label>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="rABC123..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The wallet address that created the escrow (your buyer wallet)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Sequence Number
                </label>
                <input
                  type="text"
                  value={offerSequence}
                  onChange={(e) => setOfferSequence(e.target.value)}
                  placeholder="12345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The sequence number from the EscrowCreate transaction (found on XRPL Explorer)
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⏰ Timing Note:</strong>
                <br />
                You can only finish an escrow AFTER the FinishAfter time (1 minute after creation for testing).
                If you try before, it will fail with "escrowNotReady" error.
              </p>
            </div>

            <button
              onClick={handleFinishEscrow}
              disabled={loading || !ownerAddress || !offerSequence || !crossmarkReady}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {!crossmarkReady ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Waiting for Crossmark...</span>
                </>
              ) : loading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Product Received & Release Funds</span>
                </>
              )}
            </button>

            {result && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        result.success ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {result.success ? "✅ Success!" : "❌ Failed"}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        result.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.txHash && (
                      <a
                        href={`https://testnet.xrpl.org/transactions/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                      >
                        View on Explorer →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📖 How to Find the Sequence Number</h2>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>
                  After making a purchase, you receive a transaction hash (starts with letters/numbers)
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>
                  Go to:{" "}
                  <a
                    href="https://testnet.xrpl.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    testnet.xrpl.org
                  </a>
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Paste your transaction hash in the search box</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>
                  Look for <strong>"Sequence"</strong> field in the transaction details (it's a number like
                  12345678)
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">5.</span>
                <span>
                  Also note the <strong>"Account"</strong> field - that's the Owner Address you need
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">6.</span>
                <span>Enter both values above and click "Confirm Product Received"</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
