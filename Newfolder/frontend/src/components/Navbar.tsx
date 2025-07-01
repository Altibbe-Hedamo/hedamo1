import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import hedamoLogo from '/hedamo-logo.webp'; // Update this path

interface EligibilityForm {
    category: string;
    subCategory: string[];
    productName: string;
    companyName: string;
    location: string;
}

interface FinalResponse {
    decision: 'accepted' | 'rejected';
    reason: string;
    suggested_certifications?: string[];
}

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
    const [eligibilityForm, setEligibilityForm] = useState<EligibilityForm>({
        category: '',
        subCategory: [],
        productName: '',
        companyName: '',
        location: ''
    });

    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [showQuestions, setShowQuestions] = useState(false);
    const [finalResponse, setFinalResponse] = useState<FinalResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [relevantCerts, setRelevantCerts] = useState<string[]>([]);

    const categoryOptions: { value: string; label: string; subcategories: string[] }[] = [
        {
            value: 'agriculture',
            label: 'Agriculture (Crops and Plant-Based Food Production)',
            subcategories: [ 'Organic Farming', 'Regenerative Agriculture', 'Conservation Agriculture (CA)', 'Precision Agriculture', 'Integrated Pest Management (IPM)', 'Specific Farming Systems', 'Controlled Environment Agriculture', 'Specialty Crop Practices' ],
        },
        {
            value: 'meat_poultry',
            label: 'Meat & Poultry Production',
            subcategories: [ 'Organic Meat/Poultry', 'Pasture-Raised Systems', 'Grass-Fed & Grass-Finished Systems', 'Free-Range Systems (Poultry/Eggs)', 'Animal Health & Welfare Practices', 'Grazing Management', 'Small-Scale Systems' ],
        },
        {
            value: 'dairy',
            label: 'Dairy Production',
            subcategories: [ 'Organic Dairy', 'Grass-Fed Dairy', 'Pasture-Raised Dairy Animals', 'Animal Welfare Practices (Dairy)', 'Sustainable Feed Practices (Dairy)' ],
        },
        {
            value: 'seafood',
            label: 'Seafood (Wild-Caught & Aquaculture)',
            subcategories: [ 'Wild-Caught Seafood', 'Aquaculture' ],
        },
        {
            value: 'processed_foods',
            label: 'Processed Foods',
            subcategories: [ 'Beverages', 'Food' ],
        },
        {
            value: 'textiles',
            label: 'Textiles / Clothing',
            subcategories: [ 'Fiber Sourcing', 'Dyeing & Finishing Processes', 'Manufacturing & Production Ethics', 'Artisanal Textiles' ],
        },
        {
            value: 'cosmetics',
            label: 'Cosmetics & Personal Care',
            subcategories: [ 'Certification Status', 'Formulation Attributes ("Free-From" & Safety Claims)', 'Ingredient & Preservative Systems', 'Ethical Claims', 'Production Type' ],
        },
        {
            value: 'collectives',
            label: 'XI. Animal Feed',
            subcategories: [ "Farmers' Collective Label", 'Nutritional Adequacy & Safety', 'Special Dietary Formulations & Claims', 'Ethical & Sustainability Claims', 'Feed Safety & Quality Assurance', 'Nutritional Composition & Claims', 'Sustainable & Ethical Sourcing of Feed Ingredients', 'Specialty Feeds' ],
        },
    ];

    const certificationMap: Record<string, string[]> = {
        agriculture: ["NPOP", "USDA Organic", "HACCP", "FSSAI", "Other International Certificates"],
        meat_poultry: ["Halal", "Kosher", "HACCP", "FSSAI", "Other International Certificates"],
        dairy: ["Organic Dairy", "Grass-Fed Dairy", "HACCP", "FSSAI", "Other International Certificates"],
        seafood: ["MSC", "ASC", "HACCP", "Other International Certificates"],
        processed_foods: ["HACCP", "FSSAI", "ISO 22000", "Other International Certificates"],
        textiles: ["GOTS", "Fair Trade", "Other International Certificates"],
        cosmetics: ["ECOCERT", "Leaping Bunny", "Other International Certificates"],
        collectives: ["Fair Trade", "Organic", "Other International Certificates"],
    };

    const selectedCategory = categoryOptions.find(
        (cat) => cat.value === eligibilityForm.category
    );

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setEligibilityForm(prev => ({ ...prev, category, subCategory: [] }));
        setRelevantCerts(certificationMap[category] || []);
        setSelectedCerts([]); // Reset certs when category changes
    };

    const handleCertChange = (cert: string) => {
        setSelectedCerts(prev =>
            prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
        );
    };

    const handleEligibilitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFinalResponse(null);
        setQuestions([]);

        try {
            const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
            const payload = {
                ...eligibilityForm,
                certifications: selectedCerts,
            };
            const response = await fetch(`${API_URL}/api/eligibility/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit for eligibility check.');
            }

            const data = await response.json();

            if (data.decision === 'pending' && data.questions) {
                setQuestions(data.questions);
                setShowQuestions(true);
            } else {
                setFinalResponse(data);
                setShowQuestions(false);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswersSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
            const response = await fetch(`${API_URL}/api/eligibility/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initialData: eligibilityForm,
                    answers: answers,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit answers.');
            }

            const data = await response.json();
            setFinalResponse(data);
            setShowQuestions(false);

        } catch (err: any) {
            setError(err.message || 'Failed to submit answers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [question]: value
        }));
    };

    const resetForm = () => {
        setEligibilityForm({
            category: '',
            subCategory: [],
            productName: '',
            companyName: '',
            location: ''
        });
        setQuestions([]);
        setAnswers({});
        setShowQuestions(false);
        setFinalResponse(null);
        setError(null);
        setIsEligibilityModalOpen(false);
        setSelectedCerts([]);
    };

    const openEligibilityModal = () => {
        console.log('Opening eligibility modal');
        setIsEligibilityModalOpen(true);
    };

    return (
        <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-sm p-5 flex justify-between items-center sticky top-0 z-50"
        >
            <div className="flex items-center">
                <Link to="/" className="hover:text-green-600 transition-colors flex items-center">
                    <img 
                        src={hedamoLogo} 
                        alt="Hedamo Logo" 
                        className="h-8 w-auto mr-2 ml-4" 
                    />
                </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
                <Link 
                    to="/" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Home
                </Link>
                <Link 
                    to="/about" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    About
                </Link>
                <Link 
                    to="/buy-certificate" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Packages
                </Link>
                <Link 
                    to="/career-page" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Career
                </Link>
                <Link 
                    to="/contact" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Contact
                </Link>
                <button
                    onClick={openEligibilityModal}
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Know Your Eligibility
                </button>
                <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                    Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                        to="/signup" 
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        Sign Up <FiArrowRight className="text-sm" />
                    </Link>
                </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-700 hover:text-green-600 focus:outline-none"
                >
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg p-5 flex flex-col space-y-4"
                >
                    <Link 
                        to="/" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/about" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                    <Link 
                        to="/buy-certificate" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Packages
                    </Link>
                    <Link 
                        to="/career-page" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Career
                    </Link>
                    <Link 
                        to="/contact" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contact
                    </Link>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsEligibilityModalOpen(true);
                        }}
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                    >
                        Know Your Eligibility
                    </button>
                    <Link 
                        to="/login" 
                        className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                    >
                        <Link 
                            to="/signup" 
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sign Up <FiArrowRight className="text-sm" />
                        </Link>
                    </motion.div>
                </motion.div>
            )}

            {/* Eligibility Modal */}
            {isEligibilityModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Know Your Eligibility</h2>
                                <button
                                    onClick={() => setIsEligibilityModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            {!showQuestions && !finalResponse && (
                                <form onSubmit={handleEligibilitySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={eligibilityForm.category}
                                            onChange={handleCategoryChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categoryOptions.map((cat) => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sub-category
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {selectedCategory && selectedCategory.subcategories.map((sub) => (
                                                <label key={sub} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value={sub}
                                                        checked={eligibilityForm.subCategory.includes(sub)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setEligibilityForm(prev => ({
                                                                ...prev,
                                                                subCategory: checked
                                                                    ? [...prev.subCategory, sub]
                                                                    : prev.subCategory.filter(s => s !== sub)
                                                            }));
                                                        }}
                                                        className="form-checkbox h-4 w-4 text-green-600"
                                                        disabled={!selectedCategory}
                                                    />
                                                    <span className="ml-2 text-gray-700">{sub}</span>
                                                </label>
                                            ))}
                                            {!selectedCategory && (
                                                <span className="text-gray-400">Select a category first</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            value={eligibilityForm.productName}
                                            onChange={(e) => setEligibilityForm(prev => ({ ...prev, productName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={eligibilityForm.companyName}
                                            onChange={(e) => setEligibilityForm(prev => ({ ...prev, companyName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={eligibilityForm.location}
                                            onChange={(e) => setEligibilityForm(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    {relevantCerts.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                                            <div className="flex flex-col gap-2">
                                                {relevantCerts.map(cert => (
                                                    <label key={cert} className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            value={cert}
                                                            checked={selectedCerts.includes(cert)}
                                                            onChange={() => handleCertChange(cert)}
                                                            className="form-checkbox h-4 w-4 text-green-600"
                                                        />
                                                        <span className="ml-2 text-gray-700">{cert}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEligibilityModalOpen(false)}
                                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {showQuestions && !finalResponse && (
                                <form onSubmit={handleAnswersSubmit} className="space-y-4">
                                    {questions.map((q, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{q}</label>
                                            <input
                                                type="text"
                                                onChange={(e) => handleAnswerChange(q, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                    ))}
                                    <div className="flex justify-end space-x-4 mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Answers'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {finalResponse && (
                                <div>
                                    <h3 className="text-lg font-semibold">Result: {finalResponse.decision.toUpperCase()}</h3>
                                    <p className="mt-2 text-gray-600">{finalResponse.reason}</p>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={resetForm}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </motion.nav>
    );
}

export default Navbar;