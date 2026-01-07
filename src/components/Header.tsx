"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          FinMarketplace
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">0</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
