"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { TrendingUp, Shield, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  coverImageUrl: string;
  seller: string | null;
  pdfPath: string | null;
  createdAt: string;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Discover Premium E-Books
              <br />
              <span className="text-blue-200">Secured by Blockchain</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Buy with confidence. Every transaction is secured by XRPL escrow technology,
              ensuring safe and transparent purchases of digital content.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              {[
                { icon: Shield, label: "Escrow Protected", desc: "7-day guarantee" },
                { icon: BookOpen, label: "Instant Access", desc: "Immediate download" },
                { icon: TrendingUp, label: "Best Prices", desc: "Competitive rates" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">{item.label}</p>
                  <p className="text-xs text-blue-200">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured E-Books</h2>
              <p className="text-gray-600">
                Explore curated e-books on blockchain, finance, and technology
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/list-book"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>List New Book</span>
              </Link>

              <div className="hidden sm:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {products.length} E-Books Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No E-Books Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to list an e-book!</p>
            <Link
              href="/list-book"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>List Your E-Book</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">SecureMarket</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The trusted marketplace for digital products, powered by XRP Ledger escrow technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">How It Works</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Browse premium products</li>
                <li>• Purchase with RLUSD</li>
                <li>• Funds held in escrow</li>
                <li>• Confirm & release payment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 7-day buyer protection</li>
                <li>• Blockchain-verified transactions</li>
                <li>• Automatic refund system</li>
                <li>• Encrypted file delivery</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              © 2026 SecureMarket. Built on XRP Ledger • Hackathon Project
            </p>
            <p className="text-xs text-gray-500 mt-2">
              All transactions protected by XRPL escrow smart contracts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
