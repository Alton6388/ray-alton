"use client";

import Link from "next/link";
import { EBook } from "../types/EBook";
import { BookOpen, ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: EBook;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 h-full flex flex-col cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.coverImageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Price */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
            <span className="text-lg font-bold">{product.price.toFixed(2)}</span>
            <span className="text-xs ml-1 opacity-90">RLUSD</span>
          </div>

          {/* Genre */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {product.genre}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            by {product.author}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-gray-600 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">E-Book</span>
            </div>

            <div className="flex items-center space-x-1 text-blue-600 text-sm font-semibold group-hover:space-x-2 transition-all">
              <span>View</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
