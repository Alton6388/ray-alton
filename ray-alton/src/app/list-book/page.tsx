"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { ArrowLeft, BookOpen } from "lucide-react";

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

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "Technology",
    price: "",
    coverImageUrl: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<string[]>([]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      setPdfFile(null);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openFilePicker = () => fileInputRef.current?.click();


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

    const bookData = {
      ...formData,
      price: parseFloat(formData.price),
      timestamp: new Date().toISOString(),
    };

    // Send form data and file to the server for local saving
    const fd = new FormData();
    fd.append('title', bookData.title);
    fd.append('author', bookData.author);
    fd.append('genre', bookData.genre);
    fd.append('price', String(bookData.price));
    fd.append('coverImageUrl', bookData.coverImageUrl);
    if (pdfFile) fd.append('pdfFile', pdfFile, pdfFile.name);

    try {
      // Require connected wallet to list an item
      const connectedAddress = window.crossmark?.session?.address || localStorage.getItem('walletAddress');
      if (!connectedAddress) {
        alert('Please connect your wallet before listing an item.');
        return;
      }
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      const pdfPath = uploadData?.file?.filepath || uploadData?.file?.path;

      // Create product record with returned pdfPath
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookData,
          pdfPath,
          seller: connectedAddress,
        }),
      });
      if (!productRes.ok) throw new Error('Product creation failed');
      const created = await productRes.json();
      console.log('Created product:', created);

      // Reset form on success
      setFormData({ title: '', author: '', genre: 'Technology', price: '', coverImageUrl: '' });
      setPdfFile(null);
      setErrors([]);

      alert('✅ Book listing created and PDF uploaded!');
    } catch (err) {
      console.error(err);
      alert('❌ Upload or product creation failed. See console.');
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

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload PDF <span className="text-red-600">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="pdfFile"
                  name="pdfFile"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Choose PDF
                  </button>

                  <div className="text-sm text-gray-700">
                    {pdfFile ? (
                      <span className="text-green-600">{pdfFile.name}</span>
                    ) : (
                      <span className="text-gray-500">No file selected</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Only PDF files are accepted. Max size: 500MB.
                </p>
              </div>

              {/* Form Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ℹ️ Note:</strong> Your e-book will be listed in our marketplace
                  and protected by XRPL escrow for secure transactions.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  isFormValid
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                List My E-Book
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
