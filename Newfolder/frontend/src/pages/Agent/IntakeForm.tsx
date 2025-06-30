import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiMic, FiUpload } from 'react-icons/fi';

interface Answer {
  question: string;
  response: string;
}

const IntakeForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [sessionId] = useState(Math.random().toString(36).substring(2, 11));
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [, setCompleted] = useState(false);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screen, setScreen] = useState<'category' | 'chat' | 'result'>('category');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = [
    { value: 'food', label: 'Food', subcategories: ['Regenerative', 'General'] },
    { value: 'clothing', label: 'Clothing', subcategories: ['Cotton'] },
    { value: 'cosmetics', label: 'Cosmetics', subcategories: ['Indian-made'] },
    { value: 'Agriculture', label: 'Agriculture', subcategories: [] },
    { value: 'Animal-fodder', label: 'Animal Fodder', subcategories: [] },
  ];

  const fetchNextQuestion = async (userResponse?: string, fileData?: FormData) => {
    setLoading(true);
    try {
      const formData = fileData || new FormData();
      if (!fileData) {
        formData.append('session_id', sessionId);
        if (userResponse) formData.append('user_response', userResponse);
        if (file) formData.append('file', file);
        if (screen === 'category') {
          formData.append('category', category);
          formData.append('sub_categories', JSON.stringify([subcategory]));
        }
      }

      const response = await api.post('/api/chats', formData, {
        headers: { 'Content-Type': fileData ? 'multipart/form-data' : 'application/json' },
      });

      if (response.data.success) {
        if (response.data.completed) {
          setScreen('result');
          setAnswers(response.data.answers.map((ans: string, idx: number) => ({
            question: `Q${idx + 1}`,
            response: ans,
          })));
          setReport(response.data.report);
          setCompleted(true);
          localStorage.setItem('summaryReport', response.data.report);
          localStorage.setItem('summaryAnswers', JSON.stringify(response.data.answers));
          // Update product_progress and report_status
          await api.post('/api/submit-intake-form', { productId });
          toast.success('Intake form completed successfully');
        } else {
          setQuestion(response.data.message);
          setScreen('chat');
          if (userResponse || fileData) {
            setAnswers([...answers, { question, response: userResponse || '[File Uploaded]' }]);
          }
        }
      } else {
        toast.error(response.data.error || 'Failed to process response');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setLoading(false);
      setResponse('');
      setFile(null);
    }
  };

  useEffect(() => {
    const storedReport = localStorage.getItem('summaryReport');
    const storedAnswers = JSON.parse(localStorage.getItem('summaryAnswers') || '[]');
    if (storedReport && storedAnswers.length > 0) {
      setScreen('result');
      setAnswers(storedAnswers.map((ans: string, idx: number) => ({
        question: `Q${idx + 1}`,
        response: ans,
      })));
      setReport(storedReport);
      setCompleted(true);
    } else if (screen === 'chat') {
      fetchNextQuestion();
    }
  }, [screen]);

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
    if (response) formData.append('user_response', response);
    if (file) formData.append('file', file);
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
    localStorage.clear();
    setScreen('category');
    setCategory('');
    setSubcategory('');
    setAnswers([]);
    setReport('');
    setCompleted(false);
    setQuestion('');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
        {screen === 'category' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Intake Questionnaire</h1>
            <p className="text-gray-600 mb-4 text-center">Please select a category and subcategory to begin:</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <button
              onClick={handleStartQuestionnaire}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Start Questionnaire
            </button>
          </div>
        )}

        {screen === 'chat' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Intake Questionnaire</h1>
            {loading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <>
                <p className="text-lg text-gray-700 mb-4 text-center animate-fade-in">{question}</p>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center mb-4">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <FiUpload className="ml-2 text-gray-500" size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={handleRecord}
                    className={`w-full px-4 py-2 mb-4 ${
                      recording ? 'bg-red-600' : 'bg-blue-600'
                    } text-white rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center`}
                  >
                    <FiMic className="mr-2" />
                    {recording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </form>
                <div className="mt-6 max-h-64 overflow-y-auto">
                  {answers.map((ans, idx) => (
                    <div key={idx} className="mb-4 p-3 bg-gray-100 rounded-md">
                      <p className="font-medium text-gray-800">{ans.question}</p>
                      <p className="text-gray-600">Answer: {ans.response}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {screen === 'result' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Questionnaire Completed</h1>
            <p className="text-gray-600 mb-4 text-center">Thank you for your responses!</p>
            <div className="mb-6 max-h-64 overflow-y-auto">
              {answers.map((ans, idx) => (
                <div key={idx} className="mb-4 p-3 bg-gray-100 rounded-md">
                  <p className="font-medium text-gray-800">{ans.question}</p>
                  <p className="text-gray-600">Answer: {ans.response}</p>
                </div>
              ))}
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Summary Report</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{report}</pre>
            </div>
            <button
              onClick={() => navigate('/agent-dashboard/reports')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Reports
            </button>
            <button
              onClick={handleRestart}
              className="w-full px-4 py-2 mt-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntakeForm;