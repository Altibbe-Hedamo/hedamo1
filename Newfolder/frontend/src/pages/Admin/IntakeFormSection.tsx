import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { X, FileText, Shield } from 'lucide-react';

interface AcceptedProduct {
    id: number;
    product_name: string;
    company_name: string;
    category: string;
    created_at: string;
    summary: string;
    fir_report: string;
}

const IntakeFormSection: React.FC = () => {
    const [products, setProducts] = useState<AcceptedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<AcceptedProduct | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'fir'>('summary');

    useEffect(() => {
        const fetchAcceptedProducts = async () => {
            try {
                const response = await api.get('/api/admin/products/accepted-products');
                setProducts(response.data);
            } catch (err) {
                setError('Failed to fetch completed intake products.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAcceptedProducts();
    }, []);

    const viewSummary = (product: AcceptedProduct) => {
        if (!product.summary || !product.fir_report) {
            alert(`Product: ${product.product_name}\n\nError: Report data is incomplete or missing.`);
            return;
        }
        
        setSelectedProduct(product);
        setIsModalOpen(true);
        setActiveTab('summary');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Completed Intake Forms Summary</h1>
                <p className="text-gray-600">Products that have completed the intake process with generated reports.</p>
            </div>
            
            {products.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed intake forms found</h3>
                    <p className="text-gray-500">Complete the intake process for products to see their reports here.</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Completed Reports ({products.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                                                <div className="text-sm text-gray-500">{product.company_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(product.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                                Completed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => viewSummary(product)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                            aria-hidden="true"
                            onClick={closeModal}
                        ></div>

                        {/* Modal */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10">
                            {/* Modal Header */}
                            <div className="bg-white px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Product Report: {selectedProduct.product_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {selectedProduct.company_name} • {selectedProduct.category}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Tabs */}
                            <div className="bg-gray-50 px-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('summary')}
                                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'summary'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Summary Report
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('fir')}
                                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'fir'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Shield className="w-4 h-4 inline mr-2" />
                                        FIR Report
                                    </button>
                                </nav>
                            </div>

                            {/* Modal Content */}
                            <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
                                {activeTab === 'summary' ? (
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedProduct.summary}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedProduct.fir_report}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntakeFormSection;
