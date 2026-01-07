"use client";

import { Product } from "../types/Product";
import {
  Package,
  HardDrive,
  Shield,
  Clock,
  Download,
  Check,
} from "lucide-react";

interface ProductDetailsProps {
  product: Product;
  onBuyNow: (productId: string, price: number) => void;
}

export default function ProductDetails({
  product,
  onBuyNow,
}: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-5">
        {/* Image */}
        <div className="lg:col-span-2 relative h-96 lg:h-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">
                  Escrow Protected Purchase
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-3 p-8 lg:p-10">
          {/* Category */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-semibold uppercase tracking-wide">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline space-x-3 mb-6 pb-6 border-b border-gray-200">
            <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {product.price}
            </span>
            <span className="text-2xl text-gray-500 font-medium">RLUSD</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {product.fileSize && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-2">
                  <HardDrive className="w-5 h-5" />
                  <span className="text-sm font-medium">File Size</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {product.fileSize}
                </p>
              </div>
            )}

            {product.fileType && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">Format</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {product.fileType}
                </p>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-600" />
              <span>What You'll Get</span>
            </h3>

            <ul className="space-y-2">
              {[
                "Instant download after escrow confirmation",
                "Full commercial license included",
                "Lifetime access to updates",
                "Priority customer support",
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Protection */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  7-Day Buyer Protection
                </h3>
                <p className="text-sm text-gray-700">
                  Funds are locked in XRPL escrow. Automatic refund if you don't
                  confirm receipt.
                </p>
              </div>
            </div>
          </div>

          {/* Buy */}
          <button
            onClick={() => onBuyNow(product.id, product.price)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-bold py-5 px-8 rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all"
          >
            Secure Purchase – {product.price} RLUSD
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 XRPL escrow protected • 7-day guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
