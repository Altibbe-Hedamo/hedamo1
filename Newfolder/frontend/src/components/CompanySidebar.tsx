import React from 'react';

const sidebarItems = [
  'Profile',
  'Horizon Data',
  'Product page',
  'Ledger',
  'Price Calculator',
  'Payments',
  'Renewal remainders',
  'Help Line',
  'Legal Resources',
  'Invoicing',
  'Communication Center',
  'Customer Care',
];

const CompanySidebar: React.FC = () => {
  return (
    <aside style={{ width: 220, background: '#f5f7fa', padding: '1.5rem 0', minHeight: '100vh', borderRight: '1px solid #e5e7eb' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sidebarItems.map((item) => (
          <button
            key={item}
            style={{
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '0.75rem 1rem',
              textAlign: 'left',
              fontWeight: 500,
              fontSize: 16,
              color: '#222',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'background 0.2s',
            }}
            onClick={() => {}}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CompanySidebar; 