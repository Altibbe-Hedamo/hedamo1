import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

const IntakeFormPage = () => {
    const { productId } = useParams();
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [sectionProgress, setSectionProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/api/company/intake/product/${productId}`);
                if (response.data.success) {
                    setProduct(response.data.product);
                    // Start the conversation
                    getNextQuestion([], response.data.product);
                } else {
                    setError(response.data.error);
                }
            } catch (err) {
                setError('Failed to fetch product details.');
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const getNextQuestion = async (conv, prod) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/company/intake/next-step', {
                context: {
                    productName: prod.product_name,
                    category: prod.category,
                    subcategories: prod.sub_categories,
                    companyName: prod.company_name,
                    location: prod.location,
                    email: user.email,
                },
                conversation: conv,
                productData: prod,
                sessionId: `${user.id}_${prod.id}`,
            });

            if (response.data.success) {
                if (response.data.isComplete) {
                    setIsComplete(true);
                    setCurrentQuestion('Thank you! The questionnaire is complete.');
                } else {
                    setCurrentQuestion(response.data.nextQuestion);
                    setProgress(response.data.progress);
                    setSectionProgress(response.data.sectionProgress);
                    setCurrentSection(response.data.currentSection);
                }
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('Failed to get the next question.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (!currentAnswer.trim()) return;

        const newConversation = [
            ...conversation,
            {
                question: currentQuestion,
                answer: currentAnswer,
                section: currentSection,
                dataPoint: 'TBD', // This will be updated based on the backend response
            },
        ];

        setConversation(newConversation);
        setCurrentAnswer('');
        getNextQuestion(newConversation, product);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Product Intake Questionnaire</h1>
            {product && <h2 className="text-xl mb-4">{product.product_name}</h2>}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-blue-700">Overall Progress</span>
                        <span className="text-sm font-medium text-blue-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="chat-interface space-y-4">
                    <div className="question-area">
                        <p className="font-semibold">{currentQuestion}</p>
                    </div>

                    {!isComplete && (
                        <form onSubmit={handleAnswerSubmit} className="answer-area">
                            <textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Type your answer here..."
                                disabled={isLoading}
                            />
                            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" disabled={isLoading}>
                                {isLoading ? 'Thinking...' : 'Submit'}
                            </button>
                        </form>
                    )}

                    {isComplete && (
                        <div className="text-center">
                            <p className="text-green-600 font-bold">Questionnaire Complete!</p>
                            <Link to="/company-portal/product-page" className="text-blue-600">
                                Back to Products
                            </Link>
                        </div>
                    )}

                    {error && <p className="text-red-500">{error}</p>}
                </div>

                <div className="conversation-history mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Conversation History</h3>
                    <div className="space-y-4 mt-4">
                        {conversation.map((entry, index) => (
                            <div key={index}>
                                <p className="font-semibold text-gray-700">Q: {entry.question}</p>
                                <p className="text-gray-600">A: {entry.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntakeFormPage; 