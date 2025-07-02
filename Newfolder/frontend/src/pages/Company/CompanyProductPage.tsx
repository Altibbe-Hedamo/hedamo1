import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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

const CompanyProductPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<AcceptedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
    }, [user?.email]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                <div className="flex items-center">
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

                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Acceptance Reason</h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                    {product.reason}
                                </p>
                            </div>

                            <div className="text-xs text-gray-500 border-t pt-3">
                                Submitted on: {formatDate(product.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompanyProductPage; 