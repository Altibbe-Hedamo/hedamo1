import React, { useState, useEffect } from 'react';
import api from '../../config/axios';

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
        
        alert(`Product: ${product.product_name}\n\nSummary:\n${product.summary}\n\nFIR Report:\n${product.fir_report}`);
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Completed Intake Forms Summary</h1>
            <p className="text-gray-600 mb-6">Products that have completed the intake process with generated reports.</p>
            
            {products.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">No completed intake forms found.</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View Report</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => viewSummary(product)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IntakeFormSection;
