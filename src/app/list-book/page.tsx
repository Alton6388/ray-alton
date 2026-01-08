"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { ArrowLeft, BookOpen, Upload, X, FileText } from "lucide-react";

const GENRES = [
  "Technology",
  "Finance",
  "Education",
  "Programming",
  "Business",
  "Science",
  "History",
  "Self-Help",
  "Fiction",
  "Other",
];

export default function ListBookPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "Technology",
    price: "",
    coverImageUrl: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check wallet connection on mount and listen for changes
  useEffect(() => {
    const checkWallet = () => {
      const stored = localStorage.getItem('walletAddress');
      setWalletAddress(stored);
    };
    
    checkWallet();
    
    // Listen for storage changes (when wallet connects in header)
    const handleStorage = () => checkWallet();
    window.addEventListener('storage', handleStorage);
    
    // Also check periodically in case localStorage changes in same tab
    const interval = setInterval(checkWallet, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrors(['Only PDF files are allowed']);
      return;
    }
    
    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setErrors(['File too large. Maximum 500MB allowed.']);
      return;
    }
    
    setPdfFile(file);
    setErrors([]);
  };

  const removeFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push("Book title is required");
    if (!formData.author.trim()) newErrors.push("Author name is required");
    if (!formData.genre) newErrors.push("Genre is required");
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.push("Valid price is required");
    if (!formData.coverImageUrl.trim())
      newErrors.push("Cover image URL is required");
    if (!pdfFile) newErrors.push("PDF file is required");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      // Step 1: Upload PDF file
      console.log("📤 Uploading PDF...");
      const formDataUpload = new FormData();
      formDataUpload.append('pdf', pdfFile!);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Failed to upload PDF');
      }
      
      const uploadData = await uploadRes.json();
      console.log("PDF uploaded:", uploadData);

      // Step 2: Create product in database
      console.log("Creating product listing...");
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          price: parseFloat(formData.price),
          coverImageUrl: formData.coverImageUrl,
          seller: walletAddress,
          pdfPath: uploadData.pdfPath,
        }),
      });

      if (!productRes.ok) {
        const err = await productRes.json();
        throw new Error(err.error || 'Failed to create product');
      }

      const product = await productRes.json();
      console.log("Product created:", product);

      // Reset form
      setFormData({
        title: "",
        author: "",
        genre: "Technology",
        price: "",
        coverImageUrl: "",
      });
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert(
        `E-Book listed successfully!\n\n` +
        `Product ID: ${product.id}\n` +
        `Title: ${product.title}\n` +
        `Price: ${product.price} RLUSD\n\n` +
        `Your e-book is now available in the marketplace!`
      );

    } catch (err: any) {
      console.error("Error:", err);
      setErrors([err.message || 'An error occurred']);
      alert(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.author.trim() &&
    formData.genre &&
    formData.price &&
    parseFloat(formData.price) > 0 &&
    formData.coverImageUrl.trim() &&
    pdfFile;

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
                <BookOpen className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Wallet Connection Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your Crossmark wallet to list items for sale in the marketplace.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900">
                  <strong>How to connect:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                  <li>Click "Connect Wallet" in the header</li>
                  <li>Approve the connection in Crossmark</li>
                  <li>Return here to list your e-book</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Your wallet address will be associated with your listings.
              </p>
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              List a New E-Book
            </h1>
            <p className="text-gray-600 text-lg">
              Share your e-book with our community. Complete the form below to
              get started.
            </p>
            <p className="text-sm text-green-600 mt-2">
              ✓ Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Please fix the following:
                  </h3>
                  <ul className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Book Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Book Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., The Future of Blockchain"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-semibold text-gray-900 mb-2">
                  Author <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. Jane Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Genre */}
              <div>
                <label htmlFor="genre" className="block text-sm font-semibold text-gray-900 mb-2">
                  Genre <span className="text-red-600">*</span>
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
                  Price (RLUSD) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 9.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-gray-900 mb-2">
                  Cover Image URL <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="coverImageUrl"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleInputChange}
                  placeholder="e.g., https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a direct URL to your book cover image
                </p>
              </div>

              {/* PDF File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  PDF File <span className="text-red-600">*</span>
                  <span className="text-gray-500 font-normal ml-2">(Max 500MB)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  
                  {pdfFile ? (
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {pdfFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-medium">
                          Click to upload PDF
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          PDF files only, max 500MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Form Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ℹ️ Note:</strong> Your e-book will be listed in our marketplace
                  and protected by XRPL escrow for secure transactions. Buyers will be able
                  to download the PDF after completing the escrow payment.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isUploading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  isFormValid && !isUploading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "List My E-Book"
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                By clicking "List My E-Book", you agree to our marketplace terms
              </p>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">📝</div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-sm text-gray-600">
                Simple form to get your e-book listed quickly
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">
                All transactions protected by XRPL escrow
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-sm text-gray-600">
                Set your own price in RLUSD, instant payments
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
