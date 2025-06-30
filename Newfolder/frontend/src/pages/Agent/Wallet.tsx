import { useState, useEffect, type FormEvent } from 'react';
import api from '../../config/axios';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get('/api/agent/wallet');
        if (response.data.success) {
          setBalance(response.data.balance);
        } else {
          setError('Failed to load balance');
        }
      } catch (err) {
        setError('An error occurred while fetching balance');
      }
    };

    fetchBalance();
  }, []);

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/agent/withdraw', { amount: parseFloat(amount) });
      if (response.data.success) {
        setSuccess('Withdrawal request submitted');
        setAmount('');
        setShowWithdraw(false);
        const balanceResponse = await api.get('/api/agent/wallet');
        if (balanceResponse.data.success) {
          setBalance(balanceResponse.data.balance);
        }
      } else {
        setError(response.data.error || 'Failed to process withdrawal');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-lg font-semibold">Balance: ${balance.toFixed(2)}</p>
        <button
          onClick={() => setShowWithdraw(true)}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Withdraw
        </button>
      </div>
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={balance}
                  step="0.01"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="mr-2 px-4 py-2 text-gray-600 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;