import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Wallet & Escrow Integration Test',
  description: 'Test your wallet hooks and escrow state management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  )
}
