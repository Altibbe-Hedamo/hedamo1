import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { Link } from 'react-router-dom';

interface AcceptedProduct {
    id: number;
    product_name: string;
    company_name: string;
    category: string;
    created_at: string;
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
                setError('Failed to fetch accepted products.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAcceptedProducts();
    }, []);

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Accepted Products Summary</h1>
            <div className="bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Accepted</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Start Intake</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.company_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin-dashboard/intake-form/${product.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Start Intake
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IntakeFormSection;
