import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

interface Product {
    id: number;
    product_name: string;
    category: string;
    sub_categories: string[];
    company_name: string;
    location: string;
    certifications: string[];
}

interface ConversationEntry {
    question: string;
    answer: string;
    section: string;
    dataPoint: string;
}

const IntakeFormPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState<Product | null>(null);
    const [conversation, setConversation] = useState<ConversationEntry[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState('Loading...');
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [sectionProgress, setSectionProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!user) {
                setError("User not authenticated.");
                setIsLoading(false);
                return;
            }
            try {
                const response = await api.get(`/api/company/intake/product/${productId}`);
                if (response.data.success) {
                    const fetchedProduct: Product = response.data.product;
                    setProduct(fetchedProduct);
                    await getNextQuestion([], fetchedProduct);
                } else {
                    setError(response.data.error || 'Failed to fetch product.');
                }
            } catch (err) {
                setError('An error occurred while fetching product details.');
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, user]);

    const getNextQuestion = async (conv: ConversationEntry[], prod: Product) => {
        if (!user) {
            setError("Cannot proceed without an authenticated user.");
            return;
        }
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
                    certifications: prod.certifications || [],
                },
                conversation: conv,
                productData: prod,
                sessionId: `${user.id}_${prod.id}`,
            });

            if (response.data.success) {
                if (response.data.isComplete) {
                    setIsComplete(true);
                    setCurrentQuestion('Thank you! The questionnaire is complete.');
                    setProgress(100);
                    setSectionProgress(100);
                } else {
                    setCurrentQuestion(response.data.nextQuestion);
                    setProgress(response.data.progress || 0);
                    setSectionProgress(response.data.sectionProgress || 0);
                    setCurrentSection(response.data.currentSection || '');
                }
            } else {
                setError(response.data.error || 'An error occurred.');
            }
        } catch (err) {
            setError('Failed to get the next question from the AI service.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentAnswer.trim() || !product) return;

        const newEntry: ConversationEntry = {
            question: currentQuestion,
            answer: currentAnswer,
            section: currentSection,
            dataPoint: 'TBD',
        };

        const newConversation = [...conversation, newEntry];
        setConversation(newConversation);
        setCurrentAnswer('');
        await getNextQuestion(newConversation, product);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Product Intake Questionnaire</h1>
            {product && <h2 className="text-xl text-gray-600 mb-6">For: {product.product_name}</h2>}
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-6 space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-blue-700">Overall Progress</span>
                            <span className="text-sm font-medium text-blue-700">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-purple-700">Section Progress ({currentSection})</span>
                            <span className="text-sm font-medium text-purple-700">{Math.round(sectionProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${sectionProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="chat-interface space-y-4">
                    <div className="question-area p-4 bg-gray-100 rounded-lg">
                        <p className="font-semibold text-gray-800">{currentQuestion}</p>
                    </div>

                    {!isComplete && (
                        <form onSubmit={handleAnswerSubmit} className="answer-area">
                            <textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your answer here..."
                                disabled={isLoading}
                                rows={4}
                            />
                            <button type="submit" className="mt-2 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors" disabled={isLoading}>
                                {isLoading ? 'Thinking...' : 'Submit Answer'}
                            </button>
                        </form>
                    )}

                    {isComplete && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-green-700 font-bold text-xl">Questionnaire Complete!</p>
                            <Link to="/company-portal/product-page" className="text-blue-600 hover:underline mt-2 inline-block">
                                Back to Products Page
                            </Link>
                        </div>
                    )}

                    {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}
                </div>

                {conversation.length > 0 && (
                    <div className="conversation-history mt-8">
                        <h3 className="text-xl font-semibold border-b pb-2 mb-4">Conversation History</h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                            {conversation.map((entry, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-md">
                                    <p className="font-semibold text-gray-800">Q: {entry.question}</p>
                                    <p className="text-gray-600 mt-1">A: {entry.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntakeFormPage; 