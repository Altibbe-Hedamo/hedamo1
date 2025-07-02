import React, { useState, useEffect } from 'react';

interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'income' | 'expense' | 'transfer';
}

const CompanyLedgerPage: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Dummy data for company ledger
    const dummyData: LedgerEntry[] = [
      {
        id: 1,
        date: '2024-01-15',
        description: 'Product Sales Revenue',
        debit: 0,
        credit: 25000,
        balance: 25000,
        type: 'income'
      },
      {
        id: 2,
        date: '2024-01-16',
        description: 'Agent Commission Payment',
        debit: 2500,
        credit: 0,
        balance: 22500,
        type: 'expense'
      },
      {
        id: 3,
        date: '2024-01-17',
        description: 'Platform Service Fee',
        debit: 1250,
        credit: 0,
        balance: 21250,
        type: 'expense'
      },
      {
        id: 4,
        date: '2024-01-18',
        description: 'Bulk Order Revenue',
        debit: 0,
        credit: 45000,
        balance: 66250,
        type: 'income'
      },
      {
        id: 5,
        date: '2024-01-19',
        description: 'Marketing Expenses',
        debit: 5000,
        credit: 0,
        balance: 61250,
        type: 'expense'
      }
    ];

    setLedgerEntries(dummyData);
    setTotalBalance(dummyData[dummyData.length - 1]?.balance || 0);
  }, []);

  const filteredEntries = filter === 'all' 
    ? ledgerEntries 
    : ledgerEntries.filter(entry => entry.type === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Company Ledger</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Balance</h3>
          <p className="text-3xl font-bold text-green-600">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Income</h3>
          <p className="text-3xl font-bold text-blue-600">$70,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">$8,750</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${entry.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.type === 'income' ? 'bg-green-100 text-green-800' :
                      entry.type === 'expense' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export to PDF
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default CompanyLedgerPage; 