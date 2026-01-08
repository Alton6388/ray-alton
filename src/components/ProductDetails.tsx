"use client";

import { EBook } from "../types/EBook";
import {
  BookOpen,
  Shield,
  Clock,
  Download,
  Check,
  User,
  Tags,
} from "lucide-react";

interface ProductDetailsProps {
  product: EBook;
  onBuyNow: (productId: string, price: number) => void;
}

export default function ProductDetails({
  product,
  onBuyNow,
}: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-5">
        {/* Cover Image */}
        <div className="lg:col-span-2 relative h-96 lg:h-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.coverImageUrl}
            alt={product.title}
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
          {/* Genre */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
            <Tags className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-semibold uppercase tracking-wide">
              {product.genre}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>

          {/* Author */}
          <div className="flex items-center space-x-2 text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <User className="w-5 h-5" />
            <span className="text-lg font-medium">by {product.author}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3 mb-8">
            <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {product.price.toFixed(2)}
            </span>
            <span className="text-2xl text-gray-500 font-medium">RLUSD</span>
          </div>

          {/* Book Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 text-gray-500 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Format</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                E-Book
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 text-gray-500 mb-2">
                <Tags className="w-5 h-5" />
                <span className="text-sm font-medium">Genre</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {product.genre}
              </p>
            </div>
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
                "Full access and ownership rights",
                "Lifetime access to your purchase",
                "Priority reader support",
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
            Purchase E-Book – {product.price.toFixed(2)} RLUSD
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 XRPL escrow protected • 7-day guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
