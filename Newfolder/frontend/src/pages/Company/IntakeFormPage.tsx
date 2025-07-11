import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';
import { Upload, Sparkles, Camera, CheckCircle } from 'lucide-react';

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
    attachments?: UploadedFile[];
}

interface UploadedFile {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    extractedContent?: string;
    analysis?: string;
}

interface AnswerEnhancement {
    isComplete: boolean;
    suggestions: string[];
    missingInfo: string[];
    concerns: string[];
    enhancedAnswer?: string;
}

interface GeneratedReport {
    summary: string;
    fir_report: string;
    product_name: string;
    company_name: string;
    category: string;
}

const IntakeFormPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const { user } = useContext(AuthContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [currentDataPoint, setCurrentDataPoint] = useState('');
    
    // Enhanced features state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [answerEnhancement, setAnswerEnhancement] = useState<AnswerEnhancement | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [ocrResults, setOcrResults] = useState<string[]>([]);
    
    // Report generation state
    const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
    const [isPollingReport, setIsPollingReport] = useState(false);
    const [reportStatus, setReportStatus] = useState<string>('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeReportTab, setActiveReportTab] = useState<'summary' | 'fir'>('summary');

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

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        const newUploadedFiles: UploadedFile[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('document', file);
            formData.append('sessionId', `${user?.id}_${product?.id}`);
            formData.append('currentSection', currentSection);
            formData.append('currentDataPoint', currentDataPoint);

            try {
                const response = await api.post('/api/company/intake/upload-document', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    const uploadedFile: UploadedFile = {
                        ...response.data.file,
                        extractedContent: response.data.extractedContent,
                        analysis: response.data.analysis
                    };
                    newUploadedFiles.push(uploadedFile);
                    
                    if (response.data.extractedContent) {
                        setOcrResults(prev => [...prev, response.data.extractedContent]);
                    }
                }
            } catch (error) {
                console.error('File upload error:', error);
                setError('Failed to upload file: ' + file.name);
            }
        }
        
        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        setIsUploading(false);
        setShowFileUpload(false);
    };

    const enhanceAnswer = async () => {
        if (!currentAnswer.trim() || !product) return;
        
        setIsEnhancing(true);
        try {
            const response = await api.post('/api/company/intake/enhance-answer', {
                question: currentQuestion,
                answer: currentAnswer,
                context: {
                    productName: product.product_name,
                    category: product.category,
                    companyName: product.company_name
                }
            });

            if (response.data.success && response.data.enhancement) {
                setAnswerEnhancement(response.data.enhancement);
            }
        } catch (error) {
            console.error('Answer enhancement error:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const applyEnhancedAnswer = () => {
        if (answerEnhancement?.enhancedAnswer) {
            setCurrentAnswer(answerEnhancement.enhancedAnswer);
            setAnswerEnhancement(null);
        }
    };

    const insertOcrText = (text: string) => {
        setCurrentAnswer(prev => prev + (prev ? '\n\n' : '') + text);
    };

    // Poll for generated report
    const pollForReport = async (acceptedProductId: number) => {
        setIsPollingReport(true);
        setReportStatus('Generating report...');
        
        const maxAttempts = 30; // 30 attempts with 2 second intervals = 1 minute max
        let attempts = 0;
        
        const poll = async () => {
            try {
                const response = await api.get(`/api/company/intake/report/${acceptedProductId}`);
                
                if (response.data.success && response.data.reportReady) {
                    setGeneratedReport(response.data.report);
                    setReportStatus('Report generated successfully!');
                    setIsPollingReport(false);
                    setShowReportModal(true);
                    return;
                }
                
                if (response.data.success && !response.data.reportReady) {
                    setReportStatus(response.data.message || 'Generating report...');
                    attempts++;
                    
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 2000); // Poll every 2 seconds
                    } else {
                        setReportStatus('Report generation is taking longer than expected. Please check back later.');
                        setIsPollingReport(false);
                    }
                }
            } catch (error) {
                console.error('Error polling for report:', error);
                setReportStatus('Error checking report status.');
                setIsPollingReport(false);
            }
        };
        
        poll();
    };

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
                    
                    // Start polling for the generated report
                    if (prod.id) {
                        pollForReport(prod.id);
                    }
                } else {
                    setCurrentQuestion(response.data.nextQuestion);
                    setProgress(response.data.progress || 0);
                    setSectionProgress(response.data.sectionProgress || 0);
                    setCurrentSection(response.data.currentSection || '');
                    setCurrentDataPoint(response.data.currentDataPoint || '');
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
            dataPoint: currentDataPoint,
            attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
        };

        const newConversation = [...conversation, newEntry];
        setConversation(newConversation);
        setCurrentAnswer('');
        setUploadedFiles([]);
        setOcrResults([]);
        setAnswerEnhancement(null);
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
                        <div className="answer-area space-y-4">
                            {/* File Upload Section */}
                            <div className="border border-dashed border-gray-300 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Enhanced Input Options</span>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowFileUpload(!showFileUpload)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Upload className="h-4 w-4 mr-1" />
                                            Upload Files
                                        </button>
                                        <button
                                            type="button"
                                            onClick={enhanceAnswer}
                                            disabled={!currentAnswer.trim() || isEnhancing}
                                            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300"
                                        >
                                            <Sparkles className="h-4 w-4 mr-1" />
                                            {isEnhancing ? 'Enhancing...' : 'Enhance Answer'}
                                        </button>
                                    </div>
                                </div>

                                {showFileUpload && (
                                    <div className="border-t border-gray-200 pt-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                            onChange={(e) => handleFileUpload(e.target.files)}
                                            className="hidden"
                                        />
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400"
                                        >
                                            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">
                                                Click to upload documents, certificates, or images
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Supports: JPG, PNG, PDF, DOC, DOCX (Max 10MB)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Uploaded Files Display */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{file.originalName}</span>
                                                {file.extractedContent && (
                                                    <button
                                                        onClick={() => insertOcrText(file.extractedContent!)}
                                                        className="ml-auto text-blue-600 hover:text-blue-800 text-xs"
                                                    >
                                                        Insert Text
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* OCR Results */}
                                {ocrResults.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Text:</h4>
                                        <div className="max-h-32 overflow-y-auto space-y-2">
                                            {ocrResults.map((result, index) => (
                                                <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded border">
                                                    <div className="flex justify-between items-start">
                                                        <p className="truncate">{result.substring(0, 100)}...</p>
                                                        <button
                                                            onClick={() => insertOcrText(result)}
                                                            className="ml-2 text-blue-600 hover:text-blue-800 text-xs flex-shrink-0"
                                                        >
                                                            Insert
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Answer Enhancement Panel */}
                            {answerEnhancement && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <Sparkles className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-yellow-800 mb-2">AI Enhancement Suggestions</h4>
                                            
                                            {answerEnhancement.suggestions.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-medium text-yellow-700">Suggestions:</p>
                                                    <ul className="text-xs text-yellow-600 list-disc list-inside">
                                                        {answerEnhancement.suggestions.map((suggestion, index) => (
                                                            <li key={index}>{suggestion}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {answerEnhancement.missingInfo.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-medium text-yellow-700">Missing Information:</p>
                                                    <ul className="text-xs text-yellow-600 list-disc list-inside">
                                                        {answerEnhancement.missingInfo.map((info, index) => (
                                                            <li key={index}>{info}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {answerEnhancement.enhancedAnswer && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={applyEnhancedAnswer}
                                                        className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                                                    >
                                                        Apply Enhanced Answer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleAnswerSubmit}>
                                <textarea
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type your answer here..."
                                    disabled={isLoading}
                                    rows={4}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">
                                        {uploadedFiles.length > 0 && `${uploadedFiles.length} file(s) attached`}
                                    </span>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors" 
                                        disabled={isLoading || isUploading}
                                    >
                                        {isLoading ? 'Thinking...' : isUploading ? 'Uploading...' : 'Submit Answer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isComplete && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-green-700 font-bold text-xl">Questionnaire Complete!</p>
                            
                            {isPollingReport && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-blue-700 text-sm">{reportStatus}</span>
                                    </div>
                                </div>
                            )}
                            
                            {generatedReport && !isPollingReport && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-yellow-700 text-sm mb-2">✅ Report generated successfully!</p>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                    >
                                        View Generated Report
                                    </button>
                                </div>
                            )}
                            
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
                                    {entry.attachments && entry.attachments.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500">
                                                📎 {entry.attachments.length} file(s) attached
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && generatedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">Generated Report</h2>
                                    <p className="text-blue-100 mt-1">
                                        {generatedReport.product_name} - {generatedReport.company_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-white hover:text-gray-200 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setActiveReportTab('summary')}
                                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                        activeReportTab === 'summary'
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Summary Report
                                </button>
                                <button
                                    onClick={() => setActiveReportTab('fir')}
                                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                        activeReportTab === 'fir'
                                            ? 'border-purple-500 text-purple-600 bg-purple-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    FIR Report
                                </button>
                            </nav>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {activeReportTab === 'summary' && (
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-semibold text-blue-600 mb-4">Product Summary Report</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                            {generatedReport.summary}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeReportTab === 'fir' && (
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-semibold text-purple-600 mb-4">First Information Report (FIR)</h3>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                            {generatedReport.fir_report}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const reportContent = activeReportTab === 'summary' ? generatedReport.summary : generatedReport.fir_report;
                                    const blob = new Blob([reportContent], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${generatedReport.product_name}_${activeReportTab}_report.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Download {activeReportTab === 'summary' ? 'Summary' : 'FIR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntakeFormPage; 