import React, { useState, useEffect } from 'react';

interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

const CompanyLedgerPage: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    // Sample ledger data
    const sampleData: LedgerEntry[] = [
      {
        id: 1,
        date: '2024-01-15',
        description: 'Product Sales',
        amount: 25000,
        type: 'income'
      },
      {
        id: 2,
        date: '2024-01-16',
        description: 'Agent Commission',
        amount: 2500,
        type: 'expense'
      },
      {
        id: 3,
        date: '2024-01-17',
        description: 'Platform Fee',
        amount: 1250,
        type: 'expense'
      },
      {
        id: 4,
        date: '2024-01-18',
        description: 'Bulk Order',
        amount: 45000,
        type: 'income'
      },
      {
        id: 5,
        date: '2024-01-19',
        description: 'Marketing Costs',
        amount: 5000,
        type: 'expense'
      }
    ];

    setLedgerEntries(sampleData);
    
    // Calculate balance
    const balance = sampleData.reduce((acc, entry) => {
      return entry.type === 'income' ? acc + entry.amount : acc - entry.amount;
    }, 0);
    setTotalBalance(balance);
  }, []);

  const totalIncome = ledgerEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = ledgerEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Ledger</h1>
        <p className="text-gray-600 mt-1">Track your financial transactions</p>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Balance</h3>
          <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="divide-y">
          {ledgerEntries.map((entry) => (
            <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{entry.description}</h3>
                  <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.type === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                  <span className={`text-lg font-semibold ${
                    entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Export Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
};

export default CompanyLedgerPage; 