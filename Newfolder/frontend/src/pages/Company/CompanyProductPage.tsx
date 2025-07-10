import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface AcceptedProduct {
    id: number;
    category: string;
    sub_categories: string[];
    product_name: string;
    company_name: string;
    location: string;
    email: string;
    certifications: string[];
    decision: string;
    reason: string;
    created_at: string;
}

interface AIAnalysis {
    product_overview: string;
    key_considerations: string[];
    questions: Array<{
        question: string;
        importance: string;
        insights: string;
    }>;
}

const CompanyProductPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState<AcceptedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentLoading, setPaymentLoading] = useState<{ [key: number]: boolean }>({});
    
    // AI Analysis states
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState<{ [key: number]: boolean }>({});
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<AcceptedProduct | null>(null);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        const fetchAcceptedProducts = async () => {
            if (!user?.email) {
                setError('User email not found');
                setLoading(false);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
                const response = await fetch(`${API_URL}/api/eligibility/accepted-products/${encodeURIComponent(user.email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch accepted products');
                }

                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                } else {
                    setError(data.error || 'Failed to fetch products');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch accepted products');
            } finally {
                setLoading(false);
            }
        };

        fetchAcceptedProducts();

        // Cleanup script on unmount
        return () => {
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, [user?.email]);

    const handlePayment = async (product: AcceptedProduct) => {
        setPaymentLoading(prev => ({ ...prev, [product.id]: true }));
        
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Create Razorpay order for ₹10,000
            const orderResponse = await api.post(
                '/api/create-razorpay-order',
                {
                    amount: 10000, // ₹10,000
                    plan_type: 'product_payment',
                    product_id: product.id,
                    product_name: product.product_name
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.error || 'Failed to create payment order');
            }

            const { orderId, amount, currency } = orderResponse.data;

            // Initialize Razorpay payment
            const options = {
                key: 'rzp_live_1GFDo8lemzf1gj', // Using existing key from project
                amount: amount,
                currency: currency,
                name: 'Product Payment',
                description: `Payment for ${product.product_name}`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await api.post(
                            '/api/verify-razorpay-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_type: 'product_payment',
                                product_id: product.id
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );

                        if (verifyResponse.data.success) {
                            alert(`Payment successful for ${product.product_name}! Transaction ID: ${response.razorpay_payment_id}`);
                        } else {
                            throw new Error(verifyResponse.data.error || 'Payment verification failed');
                        }
                    } catch (error: any) {
                        alert(`Payment verification failed: ${error.response?.data?.error || error.message}`);
                    }
                },
                prefill: {
                    name: user?.name || 'Company User',
                    email: user?.email || '',
                    contact: user?.phone || '9999999999'
                },
                theme: {
                    color: '#2563eb' // Blue theme to match the button
                },
                modal: {
                    ondismiss: function() {
                        setPaymentLoading(prev => ({ ...prev, [product.id]: false }));
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            
        } catch (err: any) {
            alert(`Payment failed: ${err.response?.data?.error || err.message}`);
            setPaymentLoading(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAIAnalysis = async (product: AcceptedProduct) => {
        setAnalysisLoading(prev => ({ ...prev, [product.id]: true }));
        setSelectedProduct(product);
        
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.post(
                '/api/eligibility/analyze-product',
                {
                    product_name: product.product_name,
                    category: product.category,
                    sub_categories: product.sub_categories,
                    company_name: product.company_name,
                    location: product.location
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setAiAnalysis(response.data.data);
                setShowAnalysisModal(true);
            } else {
                throw new Error(response.data.error || 'Failed to analyze product');
            }
        } catch (err: any) {
            alert(`AI Analysis failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setAnalysisLoading(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const closeAnalysisModal = () => {
        setShowAnalysisModal(false);
        setAiAnalysis(null);
        setSelectedProduct(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Accepted Products</h2>
                <div className="text-sm text-gray-500">
                    Total Products: {products.length}
                </div>
            </div>

            {products.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
                    <div className="text-blue-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">No Accepted Products Yet</h3>
                    <p className="text-blue-700">
                        You haven't submitted any products for eligibility review yet. 
                        Use the "Know Your Eligibility" form to check if your products qualify.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-gray-600 mb-1">
                                        <span className="font-medium">Company:</span> {product.company_name}
                                    </p>
                                    <p className="text-gray-600 mb-1">
                                        <span className="font-medium">Location:</span> {product.location}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Accepted
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><span className="font-medium">Category:</span> {product.category}</p>
                                        <p><span className="font-medium">Sub-categories:</span></p>
                                        <ul className="list-disc list-inside ml-2">
                                            {product.sub_categories.map((sub, index) => (
                                                <li key={index}>{sub}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                                    {product.certifications && product.certifications.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {product.certifications.map((cert, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No certifications selected</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="border-t pt-4 mb-4">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-1">Payment Required</h4>
                                        <p className="text-sm text-gray-600">Process payment to activate this product</p>
                                        <p className="text-lg font-bold text-blue-600 mt-1">₹10,000</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => handlePayment(product)}
                                            disabled={paymentLoading[product.id]}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {paymentLoading[product.id] ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                                                    </svg>
                                                    Pay ₹10,000
                                                </>
                                            )}
                                        </button>

                                        {/* AI Analysis Button */}
                                        <button
                                            onClick={() => handleAIAnalysis(product)}
                                            disabled={analysisLoading[product.id]}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {analysisLoading[product.id] ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                    AI Analysis
                                                </>
                                            )}
                                        </button>

                                        {/* Complete Intake Form Button */}
                                        <Link
                                            to={`/company-portal/intake-form/${product.id}`}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Complete Intake Form
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 border-t pt-3">
                                Submitted on: {formatDate(product.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* AI Analysis Modal */}
            {showAnalysisModal && aiAnalysis && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    AI Analysis: {selectedProduct.product_name}
                                </h3>
                                <button
                                    onClick={closeAnalysisModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Overview */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Product Overview</h4>
                                <p className="text-blue-800">{aiAnalysis.product_overview}</p>
                            </div>

                            {/* Key Considerations */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Key Considerations</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {aiAnalysis.key_considerations.map((consideration, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{consideration}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Questions */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Deep Analysis Questions</h4>
                                <div className="space-y-4">
                                    {aiAnalysis.questions.map((question, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 text-sm font-medium">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h5 className="font-medium text-gray-900">{question.question}</h5>
                                                    <div className="space-y-1">
                                                        <div className="flex items-start">
                                                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded mr-2">Importance</span>
                                                            <p className="text-sm text-gray-600">{question.importance}</p>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded mr-2">Insights</span>
                                                            <p className="text-sm text-gray-600">{question.insights}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={closeAnalysisModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    to={`/company-portal/intake-form/${selectedProduct.id}`}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Complete Intake Form
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProductPage; 