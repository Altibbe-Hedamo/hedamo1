import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiMic, FiUpload, FiDownload } from 'react-icons/fi';

interface Answer {
  question: string;
  response: string;
  timestamp?: string;
  section?: string;
  dataPoint?: string;
}

interface ConversationData {
  id: string;
  productId: number;
  companyId: number;
  answers: Answer[];
  report: string;
  pdfUrl?: string;
  firReport?: string;
  firPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const CompanyIntakeForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [sessionId] = useState(Math.random().toString(36).substring(2, 11));
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [report, setReport] = useState('');
  const [firReport, setFirReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screen, setScreen] = useState<'category' | 'chat' | 'result'>('category');
  const [conversationId, setConversationId] = useState<string>('');
  const [productData, setProductData] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = [
    { value: 'food', label: 'Food', subcategories: ['Regenerative', 'General'] },
    { value: 'clothing', label: 'Clothing', subcategories: ['Cotton'] },
    { value: 'cosmetics', label: 'Cosmetics', subcategories: ['Indian-made'] },
    { value: 'agriculture', label: 'Agriculture', subcategories: ['General'] },
    { value: 'animal-fodder', label: 'Animal Fodder', subcategories: ['General'] },
  ];

  useEffect(() => {
    if (productId) {
      fetchProductData();
      checkExistingConversation();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      const response = await api.get(`/api/company/products/${productId}`);
      if (response.data.success) {
        const product = response.data.product;
        setProductData(product);
        setCategory(product.category || '');
        setSubcategory(product.subcategory || 'General');
        
        // If product already has category, skip category selection and start questionnaire
        if (product.category) {
          console.log('🎯 Product has category:', product.category, 'Starting questionnaire...');
          setScreen('chat');
          // Wait a bit for state to update, then fetch first question
          setTimeout(() => {
            console.log('⏰ Timeout completed, calling fetchNextQuestion');
            fetchNextQuestion();
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product data');
    }
  };

  const checkExistingConversation = async () => {
    try {
      const response = await api.get(`/api/company/intake-conversations/${productId}`);
      if (response.data.success && response.data.conversation) {
        const conversation: ConversationData = response.data.conversation;
        setConversationId(conversation.id);
        setAnswers(conversation.answers);
        setReport(conversation.report);
        setFirReport(conversation.firReport || '');
        setScreen('result');
      }
    } catch (error: any) {
      // No existing conversation, proceed normally
      console.log('No existing conversation found');
    }
  };

  const fetchNextQuestion = async (userResponse?: string, fileData?: FormData) => {
    console.log('🚀 fetchNextQuestion called with:', { userResponse, hasFile: !!fileData });
    setLoading(true);
    try {
      const formData = fileData || new FormData();
      if (!fileData) {
        formData.append('session_id', sessionId);
        formData.append('product_id', productId || '');
        if (userResponse) formData.append('user_response', userResponse);
        if (file) formData.append('file', file);
        
        // Always send product data if available
        if (productData) {
          formData.append('product_name', productData.name);
          formData.append('company_name', productData.company_name);
          formData.append('location', productData.location || '');
        }
        
        // Send category info when needed
        if (screen === 'category' || !question) {
          formData.append('category', category || productData?.category || '');
          formData.append('sub_categories', JSON.stringify([subcategory || productData?.subcategory || 'General']));
        }
        
        // Add current conversation state
        formData.append('conversation', JSON.stringify(answers.map(ans => ({
          question: ans.question,
          answer: ans.response,
          section: 'Current Section',
          dataPoint: 'Current Data Point'
        }))));
      }

      console.log('📡 Sending request to /api/company/intake-questionnaire...');
      const response = await api.post('/api/company/intake-questionnaire', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('📨 Received response:', response.data);
      if (response.data.success) {
        if (response.data.completed) {
          // Save conversation to database
          const conversationAnswers = response.data.conversation || response.data.answers || [];
          await saveConversation(conversationAnswers, response.data.report, response.data.firReport);
          
          setScreen('result');
          setAnswers(conversationAnswers.map((item: any, idx: number) => ({
            question: item.question || `Q${idx + 1}`,
            response: item.answer || item,
            timestamp: new Date().toISOString(),
            section: item.section || 'Unknown',
            dataPoint: item.dataPoint || 'Unknown'
          })));
          setReport(response.data.report);
          setFirReport(response.data.firReport || '');
          
          // Generate PDFs
          await generatePDFs(conversationAnswers, response.data.report, response.data.firReport);
          
          toast.success('AI-powered intake questionnaire completed successfully');
        } else {
          console.log('📝 Setting question:', response.data.message);
          setQuestion(response.data.message);
          setScreen('chat');
          
          // Update conversation state from AI response
          if (response.data.conversation) {
            setAnswers(response.data.conversation.map((item: any) => ({
              question: item.question,
              response: item.answer || '',
              timestamp: new Date().toISOString(),
              section: item.section || 'Unknown',
              dataPoint: item.dataPoint || 'Unknown'
            })));
          }
          
          // Show helper text and progress
          if (response.data.helperText) {
            console.log('Helper text:', response.data.helperText);
          }
          if (response.data.progress) {
            console.log(`Overall progress: ${response.data.progress}%`);
          }
          if (response.data.sectionProgress) {
            console.log(`Section progress: ${response.data.sectionProgress}%`);
          }
        }
      } else {
        toast.error(response.data.error || 'Failed to process response');
      }
    } catch (error: any) {
      console.error('❌ fetchNextQuestion error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setLoading(false);
      setResponse('');
      setFile(null);
    }
  };

  const saveConversation = async (answers: Answer[], summaryReport: string, firReport: string) => {
    try {
      const conversationData = {
        productId: parseInt(productId || '0'),
        answers,
        report: summaryReport,
        firReport,
        sessionId
      };

      const response = await api.post('/api/company/save-intake-conversation', conversationData);
      if (response.data.success) {
        setConversationId(response.data.conversationId);
      }
    } catch (error: any) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation data');
    }
  };

  const generatePDFs = async (answers: Answer[], summaryReport: string, firReport: string) => {
    try {
      // Generate summary PDF
      await api.post('/api/company/generate-summary-pdf', {
        conversationId,
        answers,
        report: summaryReport,
        productData
      });

      // Generate FIR PDF if FIR report exists
      if (firReport) {
        await api.post('/api/company/generate-fir-pdf', {
          conversationId,
          firReport,
          productData
        });
      }

      toast.success('PDF reports generated successfully');
    } catch (error: any) {
      console.error('Error generating PDFs:', error);
      toast.error('Failed to generate PDF reports');
    }
  };

  const downloadPDF = async (type: 'summary' | 'fir') => {
    try {
      const response = await api.get(`/api/company/download-pdf/${conversationId}/${type}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${productData?.name || 'product'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(`Failed to download ${type} report`);
    }
  };

  const handleStartQuestionnaire = () => {
    if (!category || !subcategory) {
      toast.error('Please select both a category and subcategory');
      return;
    }
    setScreen('chat');
    fetchNextQuestion();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response && !file) {
      toast.error('Please enter a response or upload a file');
      return;
    }
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('product_id', productId || '');
    if (response) formData.append('user_response', response);
    if (file) formData.append('file', file);
    
    // Always include product data
    if (productData) {
      formData.append('product_name', productData.name);
      formData.append('company_name', productData.company_name);
      formData.append('location', productData.location || '');
    }
    
    // Add current conversation state
    formData.append('conversation', JSON.stringify(answers.map(ans => ({
      question: ans.question,
      answer: ans.response,
      section: ans.section || 'Current Section',
      dataPoint: ans.dataPoint || 'Current Data Point'
    }))));
    
    fetchNextQuestion(response, formData);
  };

  const handleRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'voice_input.wav', { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('session_id', sessionId);
          formData.append('product_id', productId || '');
          formData.append('file', audioFile);
          fetchNextQuestion(undefined, formData);
        };
        mediaRecorderRef.current.start();
        setRecording(true);
      } catch (error) {
        toast.error('Microphone access denied or unavailable');
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  const handleRestart = () => {
    setScreen('category');
    setCategory('');
    setSubcategory('');
    setAnswers([]);
    setReport('');
    setFirReport('');
    setQuestion('');
    setConversationId('');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              AI-Powered Intake Questionnaire
            </h1>
            {productData && (
              <div className="text-center mt-2 text-gray-600">
                <p className="text-lg">Product: <span className="font-semibold">{productData.name}</span></p>
                <p>Company: <span className="font-semibold">{productData.company_name}</span></p>
              </div>
            )}
          </div>

          {screen === 'category' && (
            <div>
              <p className="text-gray-600 mb-6 text-center">Please select a category and subcategory to begin:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!category}
                  >
                    <option value="">Select a subcategory</option>
                    {category &&
                      categories
                        .find((cat) => cat.value === category)
                        ?.subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleStartQuestionnaire}
                className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
              >
                Start AI Questionnaire
              </button>
            </div>
          )}

          {screen === 'chat' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner size="large" />
                  <p className="mt-4 text-gray-600">AI is analyzing your response...</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <p className="text-lg text-gray-800 animate-fade-in">
                      {question || "Loading your personalized questionnaire..."}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your detailed answer here..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Supporting Document (Optional)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        <FiUpload className="text-gray-500" size={20} />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleRecord}
                        className={`px-6 py-3 ${
                          recording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2`}
                      >
                        <FiMic />
                        <span>{recording ? 'Stop Recording' : 'Voice Input'}</span>
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                        disabled={loading}
                      >
                        Submit Response
                      </button>
                    </div>
                  </form>
                  
                  {answers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Responses</h3>
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {answers.map((ans, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-800">{ans.question}</p>
                            <p className="text-gray-600 mt-1">Answer: {ans.response}</p>
                            {ans.timestamp && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(ans.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {screen === 'result' && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Questionnaire Completed!</h2>
                <p className="text-gray-600 mt-2">Thank you for providing detailed information about your product.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Summary Report */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Summary Report</h3>
                    <button
                      onClick={() => downloadPDF('summary')}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <FiDownload className="mr-2" size={16} />
                      Download PDF
                    </button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">{report}</pre>
                </div>

                {/* FIR Report */}
                {firReport && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">FIR Report</h3>
                      <button
                        onClick={() => downloadPDF('fir')}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        <FiDownload className="mr-2" size={16} />
                        Download PDF
                      </button>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">{firReport}</pre>
                  </div>
                )}
              </div>

              {/* Q&A History */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Question & Answer History</h3>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {answers.map((ans, idx) => (
                    <div key={idx} className="bg-white border rounded-lg p-4">
                      <p className="font-medium text-gray-800">{ans.question}</p>
                      <p className="text-gray-600 mt-1">Answer: {ans.response}</p>
                      {ans.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(ans.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/company-portal/product-page')}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                >
                  Back to Products
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Start New Questionnaire
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyIntakeForm; 