import React, { useState } from 'react';

const RULE_CATEGORIES = [
  'Eligibility Criteria',
  'Approved Services',
  'Quality Standards',
  'Prohibited Practices',
  'Termination Policy',
];

interface Rule {
  id: string;
  category: string;
  text: string;
}

const initialRules: Rule[] = [
  { id: '1', category: 'Eligibility Criteria', text: 'Must be a registered business entity.' },
  { id: '2', category: 'Approved Services', text: 'E-commerce setup, Store migration, Marketing & SEO.' },
  { id: '3', category: 'Quality Standards', text: 'Respond to all leads within 48 hours.' },
  { id: '4', category: 'Prohibited Practices', text: 'No spam or unsolicited offers.' },
  { id: '5', category: 'Termination Policy', text: 'SLPs may be removed for repeated complaints, fraud, or violation of these guidelines.' },
];

const SLPRulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [newRule, setNewRule] = useState<{ category: string; text: string }>({ category: RULE_CATEGORIES[0], text: '' });
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddRule = () => {
    if (!newRule.text.trim()) return;
    setRules([
      ...rules,
      { id: Date.now().toString(), category: newRule.category, text: newRule.text.trim() },
    ]);
    setNewRule({ category: RULE_CATEGORIES[0], text: '' });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setEditText(rule.text);
  };

  const handleSaveEdit = () => {
    if (!editingRule) return;
    setRules(rules.map(rule => rule.id === editingRule.id ? { ...rule, text: editText } : rule));
    setEditingRule(null);
    setEditText('');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">SLP Rules & Guidelines</h1>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Add Rule */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Rule</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <select
              className="border rounded px-3 py-2 text-gray-700"
              value={newRule.category}
              onChange={e => setNewRule(r => ({ ...r, category: e.target.value }))}
            >
              {RULE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              className="flex-1 border rounded px-3 py-2 text-gray-700"
              type="text"
              placeholder="Enter rule/guideline text"
              value={newRule.text}
              onChange={e => setNewRule(r => ({ ...r, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleAddRule(); }}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={handleAddRule}
            >
              Add Rule
            </button>
          </div>
        </div>
        {/* Rules by Category */}
        {RULE_CATEGORIES.map(category => (
          <div key={category} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">{category}</h2>
            <ul className="space-y-3">
              {rules.filter(rule => rule.category === category).length === 0 && (
                <li className="text-gray-400 italic">No rules yet.</li>
              )}
              {rules.filter(rule => rule.category === category).map(rule => (
                <li key={rule.id} className="flex items-start justify-between group">
                  {editingRule && editingRule.id === rule.id ? (
                    <>
                      <input
                        className="flex-1 border rounded px-2 py-1 text-gray-700 mr-2"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
                      />
                      <button className="text-green-600 font-semibold mr-2" onClick={handleSaveEdit}>Save</button>
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => setEditingRule(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-700">{rule.text}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEditRule(rule)}>Edit</button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRule(rule.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SLPRulesPage; 