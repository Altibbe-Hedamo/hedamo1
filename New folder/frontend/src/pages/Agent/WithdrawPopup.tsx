interface WalletProps {
  balance: number;
  onWithdraw: () => void;
}

const Wallet: React.FC<WalletProps> = ({ balance, onWithdraw }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">Wallet Balance</h3>
        <p className="text-2xl font-bold text-gray-900">${balance.toFixed(2)}</p>
      </div>
      <button
        onClick={onWithdraw}
        disabled={balance <= 0}
        className={`px-4 py-2 rounded-md text-white ${
          balance <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        Withdraw
      </button>
    </div>
  );
};

export default Wallet;