# Team Ray-Alton 🚀
**A Secure Marketplace Built on XRP Ledger**

[![TypeScript](https://img.shields.io/badge/TypeScript-72. 2%25-blue)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-21.5%25-yellow)](https://www.javascript.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black)](https://nextjs.org/)
[![XRP Ledger](https://img.shields.io/badge/XRP%20Ledger-Testnet-green)](https://xrpl.org/)

---

## 📖 About

Team Ray-Alton is a decentralized marketplace built on the XRP Ledger (XRPL) that enables secure digital product transactions using cryptocurrency escrow.  This hackathon project demonstrates how blockchain technology can create trustless transactions between buyers and sellers through smart escrow contracts.

### The Problem We Solve
Traditional digital marketplaces require trust in centralized intermediaries.  Team Ray-Alton eliminates this need by using XRPL's native escrow functionality to hold funds securely until both parties fulfill their obligations.

### Tech Stack
- **Frontend**:  Next.js 15 with React 18, TypeScript, and Tailwind CSS
- **Blockchain**: XRP Ledger (XRPL Testnet)
- **Wallet Integration**: Crossmark Wallet SDK
- **Currency**: RLUSD (Ripple USD) stablecoin

---

## ✨ Features

### 🛍️ Marketplace
- **Browse Products**: Discover digital goods (books, courses, software) listed by sellers
- **Product Listings**:  Sellers can list items with descriptions, pricing, and file uploads
- **Secure Payments**: All transactions use RLUSD on the XRP Ledger

### 🔒 Escrow Protection
- **Conditional Escrow**: Funds are locked in blockchain escrow upon purchase
- **Time-Based Release**: 7-day buyer protection window
- **Crypto-Conditions**: Uses preimage/fulfillment conditions for secure releases
- **Auto-Refund**: Automatic refund if escrow expires without fulfillment

### 💼 Crossmark Wallet Integration
- **One-Click Connect**: Seamless wallet connection via Crossmark extension
- **Transaction Signing**: Sign escrow create and finish transactions directly
- **Address Verification**: Ensures wallet consistency throughout transactions

### 🛠️ Diagnostic Tools
- **Escrow Diagnostics**: Command-line tool to check escrow status
- **Account Verification**: Check XRPL account balances and activation
- **Transaction Tracking**: View transaction history and escrow objects

---

## 🚀 Getting Started

### Prerequisites
- Node. js 18+ and npm
- [Crossmark Wallet](https://crossmark.io) browser extension
- XRPL Testnet account with test XRP ([Get from faucet](https://xrpl.org/resources/dev-tools/xrp-faucets))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Alton6388/ray-alton.git
cd ray-alton
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_XRPL_NETWORK=testnet
NEXT_PUBLIC_XRPL_SERVER=wss://s. altnet.rippletest.net:51233
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Usage

### For Buyers

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Approve Crossmark connection request

2. **Browse & Purchase**
   - Browse available products on the marketplace
   - Click a product to view details
   - Click "Buy with RLUSD" to initiate purchase
   - Approve the escrow creation transaction in Crossmark

3. **Complete Purchase**
   - After receiving the product, go to "Finish Escrow" page
   - Enter the Owner Address (seller) and Offer Sequence Number
   - Confirm to release funds to seller

### For Sellers

1. **List a Product**
   - Navigate to "List Book" (or product listing page)
   - Fill in product details (title, description, price, genre)
   - Upload product files (PDF, etc.)
   - Submit listing

2. **Manage Escrows**
   - Track purchases through escrow page
   - After time lock expires, you can finish escrow if buyer doesn't respond

### Using Diagnostic Tool

Check escrow status from command line: 

```bash
# Check account and escrows
node diagnose-escrow.js <buyer-address>

# Check specific transaction
node diagnose-escrow. js --tx <transaction-hash>
```

---

## 🏗️ Project Structure

```
ray-alton/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Marketplace homepage
│   │   ├── escrow/            # Escrow management page
│   │   ├── list-book/         # Product listing page
│   │   └── product/[id]/      # Product detail page
│   ├── components/            # React components
│   │   ├── Header.tsx         # Navigation with wallet connect
│   │   ├── ProductCard.tsx    # Product display card
│   │   └── ProductDetails.tsx # Product detail component
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCrossmarkReady.ts
│   │   └── useEscrow.js
│   └── utils/                 # Utility functions
│       ├── xrplEscrow.ts      # Escrow verification logic
│       └── xrplQuery.ts       # XRPL API queries
├── data/                      # Data files
├── docs/                      # Documentation
├── uploads/                   # Uploaded product files
├── diagnose-escrow.js         # CLI diagnostic tool
├── fulfillments. json          # Escrow fulfillment storage
└── package.json
```

---

## 🔐 How Escrow Works

1. **Buyer initiates purchase** → EscrowCreate transaction sent to XRPL
2. **Funds locked** → RLUSD held in blockchain escrow with crypto-condition
3. **Seller delivers product** → Digital files/access provided to buyer
4. **Buyer confirms** → EscrowFinish transaction releases funds to seller
5. **Time protection** → If buyer doesn't finish, seller can claim after time lock

### Escrow Parameters
- **Time Lock**: 60 seconds minimum (1 week for production)
- **Condition**:  Preimage-based crypto-condition for security
- **Currency**: RLUSD stablecoin

---

## 🧪 Testing on Testnet

This application uses **XRPL Testnet** for development. All transactions use test funds with no real value.

### Get Test Funds
1. Visit [XRPL Faucet](https://xrpl.org/resources/dev-tools/xrp-faucets)
2. Enter your Crossmark testnet address
3. Receive test XRP and RLUSD

### Testnet Explorer
View transactions on:  [Testnet Explorer](https://testnet.xrpl.org/)

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Dependencies
- `xrpl` - XRP Ledger JavaScript library
- `@crossmarkio/sdk` - Crossmark wallet integration
- `five-bells-condition` - Crypto-condition generation
- `next` - React framework
- `tailwindcss` - Styling

---

## 🤝 Contributing

This is a hackathon project!  Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🏆 Hackathon Project

Built for NUS Fintech Summit 2026 to demonstrate secure decentralized commerce on XRPL.

### Team
- **Developers**: Ray & Alton
- **Repository**: [Alton6388/ray-alton](https://github.com/Alton6388/ray-alton)

---

## 🔗 Links

- [XRP Ledger Documentation](https://xrpl.org/)
- [Crossmark Wallet](https://crossmark.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [XRPL Testnet Faucet](https://xrpl.org/resources/dev-tools/xrp-faucets)

---

## 📞 Support

Need help? Check our diagnostic tool: 
```bash
node diagnose-escrow.js --help
```

Or reach out through [GitHub Issues](https://github.com/Alton6388/ray-alton/issues)

---

**⚡ Built on XRP Ledger • Powered by Crossmark • Secured by Blockchain**
