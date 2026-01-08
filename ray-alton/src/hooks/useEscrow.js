import { useState } from 'react';

export function useEscrow() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createEscrow = async (productId, amount, sellerAddress, buyerAddress) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Person 1 will provide real escrow function
      // For now, mock the escrow creation
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      
      const newEscrow = {
        id: `escrow_${Date.now()}`,
        productId,
        amount,
        sellerAddress,
        buyerAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setEscrows(prev => [...prev, newEscrow]);
      setLoading(false);
      return newEscrow;
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const completeEscrow = async (escrowId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Person 1 will provide real finish function
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEscrows(prev => 
        prev.map(e => 
          e.id === escrowId 
            ? { ...e, status: 'completed', completedAt: new Date().toISOString() }
            : e
        )
      );
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const cancelEscrow = async (escrowId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Person 1 will provide real cancel function
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEscrows(prev => 
        prev.map(e => 
          e.id === escrowId 
            ? { ...e, status: 'cancelled' }
            : e
        )
      );
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getProductEscrow = (productId, buyerAddress) => {
    return escrows.find(e => 
      e.productId === productId && 
      e.buyerAddress === buyerAddress &&
      e.status === 'pending'
    );
  };

  return {
    escrows,
    loading,
    error,
    createEscrow,
    completeEscrow,
    cancelEscrow,
    getProductEscrow
  };
}