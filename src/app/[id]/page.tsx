"use client";

import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import ProductDetails from "../../../components/ProductDetails";
import { mockProducts } from "../../../lib/mockProducts";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  const product = mockProducts.find((p) => p.id === productId);

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

  const handleBuyNow = (productId: string, price: number) => {
    console.log(`Buy Now clicked for product ${productId} at ${price} RLUSD`);
    alert(
      `🔗 Integration Ready!\n\n` +
        `Product: ${productId}\n` +
        `Price: ${price} RLUSD\n\n` +
        `Person 4 will connect this to:\n` +
        `• Person 1's createEscrow() function\n` +
        `• Person 3's wallet state\n\n` +
        `Stay tuned! 🚀`
    );
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
