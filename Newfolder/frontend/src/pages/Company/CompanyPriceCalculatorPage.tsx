import React, { useState } from 'react';

interface PricingFactors {
  baseCost: number;
  agentCommission: number;
  platformFee: number;
  marketingCost: number;
  profitMargin: number;
  quantity: number;
}

const CompanyPriceCalculatorPage: React.FC = () => {
  const [pricingFactors, setPricingFactors] = useState<PricingFactors>({
    baseCost: 0,
    agentCommission: 10,
    platformFee: 5,
    marketingCost: 0,
    profitMargin: 20,
    quantity: 1
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [breakdown, setBreakdown] = useState<any>({});

  const calculatePrice = () => {
    const {
      baseCost,
      agentCommission,
      platformFee,
      marketingCost,
      profitMargin,
      quantity
    } = pricingFactors;

    const totalCost = baseCost + marketingCost;
    const agentCommissionAmount = (totalCost * agentCommission) / 100;
    const platformFeeAmount = (totalCost * platformFee) / 100;
    const profitAmount = (totalCost * profitMargin) / 100;
    
    const totalPrice = totalCost + agentCommissionAmount + platformFeeAmount + profitAmount;
    const pricePerUnit = totalPrice / quantity;

    setCalculatedPrice(pricePerUnit);
    setBreakdown({
      baseCost,
      marketingCost,
      agentCommission: agentCommissionAmount,
      platformFee: platformFeeAmount,
      profit: profitAmount,
      totalCost,
      totalPrice,
      pricePerUnit
    });
  };

  const handleInputChange = (field: keyof PricingFactors, value: number) => {
    setPricingFactors(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCalculator = () => {
    setPricingFactors({
      baseCost: 0,
      agentCommission: 10,
      platformFee: 5,
      marketingCost: 0,
      profitMargin: 20,
      quantity: 1
    });
    setCalculatedPrice(0);
    setBreakdown({});
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Price Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Pricing Factors</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Product Cost ($)
              </label>
              <input
                type="number"
                value={pricingFactors.baseCost}
                onChange={(e) => handleInputChange('baseCost', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketing Cost ($)
              </label>
              <input
                type="number"
                value={pricingFactors.marketingCost}
                onChange={(e) => handleInputChange('marketingCost', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Commission (%)
              </label>
              <input
                type="number"
                value={pricingFactors.agentCommission}
                onChange={(e) => handleInputChange('agentCommission', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Fee (%)
              </label>
              <input
                type="number"
                value={pricingFactors.platformFee}
                onChange={(e) => handleInputChange('platformFee', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profit Margin (%)
              </label>
              <input
                type="number"
                value={pricingFactors.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={pricingFactors.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                min="1"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={calculatePrice}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Calculate Price
              </button>
              <button
                onClick={resetCalculator}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Price Breakdown</h2>
          
          {calculatedPrice > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Recommended Price</h3>
                <p className="text-3xl font-bold text-green-600">${calculatedPrice.toFixed(2)}</p>
                <p className="text-sm text-green-600">per unit</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Base Cost:</span>
                  <span className="font-medium">${breakdown.baseCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Marketing Cost:</span>
                  <span className="font-medium">${breakdown.marketingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Agent Commission ({pricingFactors.agentCommission}%):</span>
                  <span className="font-medium">${breakdown.agentCommission?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Platform Fee ({pricingFactors.platformFee}%):</span>
                  <span className="font-medium">${breakdown.platformFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Profit ({pricingFactors.profitMargin}%):</span>
                  <span className="font-medium">${breakdown.profit?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-gray-800 font-semibold">Total Cost:</span>
                  <span className="font-semibold">${breakdown.totalCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-800 font-semibold">Total Price:</span>
                  <span className="font-semibold text-blue-600">${breakdown.totalPrice?.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Pricing Summary</h4>
                <p className="text-sm text-blue-700">
                  For {pricingFactors.quantity} unit(s), the total revenue would be{' '}
                  <span className="font-semibold">${(calculatedPrice * pricingFactors.quantity).toFixed(2)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Enter pricing factors and click "Calculate Price" to see the breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setPricingFactors({
                baseCost: 50,
                agentCommission: 10,
                platformFee: 5,
                marketingCost: 10,
                profitMargin: 25,
                quantity: 1
              });
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold">Standard Product</h3>
            <p className="text-sm text-gray-600">Base: $50, Marketing: $10, 25% profit</p>
          </button>
          <button
            onClick={() => {
              setPricingFactors({
                baseCost: 100,
                agentCommission: 15,
                platformFee: 8,
                marketingCost: 25,
                profitMargin: 30,
                quantity: 1
              });
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold">Premium Product</h3>
            <p className="text-sm text-gray-600">Base: $100, Marketing: $25, 30% profit</p>
          </button>
          <button
            onClick={() => {
              setPricingFactors({
                baseCost: 25,
                agentCommission: 8,
                platformFee: 3,
                marketingCost: 5,
                profitMargin: 20,
                quantity: 1
              });
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold">Budget Product</h3>
            <p className="text-sm text-gray-600">Base: $25, Marketing: $5, 20% profit</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyPriceCalculatorPage; 