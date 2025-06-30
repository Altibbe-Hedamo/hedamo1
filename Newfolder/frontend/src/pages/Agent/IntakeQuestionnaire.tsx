import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import api from '../../config/axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Answer {
  question: string;
  response: string;
}

interface QuestionnaireProps {
  productId?: number;
}

const subcategories: { [key: string]: string[] } = {
  food: ['Regenerative', 'General'],
  clothing: ['Cotton'],
  cosmetics: ['Indian-made'],
  Agriculture: ['General'],
  'Animal-fodder': ['General'],
};

const Questionnaire: React.FC<QuestionnaireProps> = ({ productId }) => {
  const [sessionId] = useState<string>(Math.random().toString(36).substr(2, 9));
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [, setCurrentQuestion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [screen, setScreen] = useState<'category' | 'chat' | 'result'>('category');
  const [questionText, setQuestionText] = useState<string>('Loading question...');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [report, setReport] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [spinnerText, setSpinnerText] = useState<string>('Validating...');
  const [responseText, setResponseText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fadeClass, setFadeClass] = useState<string>('fade-in');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { productId: paramProductId } = useParams<{ productId: string }>();

  const effectiveProductId = productId || (paramProductId ? parseInt(paramProductId) : undefined);

  useEffect(() => {
    const storedReport = localStorage.getItem('summaryReport');
    const storedAnswers = JSON.parse(localStorage.getItem('summaryAnswers') || '[]');
    if (storedReport && storedAnswers.length > 0) {
      setAnswers(storedAnswers.map((ans: string, idx: number) => ({ question: `Q${idx + 1}`, response: ans })));
      setReport(storedReport);
      setScreen('result');
    } else if (effectiveProductId) {
      fetchProductDetails();
    }
  }, [effectiveProductId]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/api/agent/products/${effectiveProductId}`);
      if (response.data.success) {
        const { category, subcategory } = response.data.product;
        setSelectedCategory(category);
        setSelectedSubcategory(subcategory || 'General');
        setScreen('chat');
        fetchNextQuestion();
      } else {
        throw new Error(response.data.error || 'Failed to load product details');
      }
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      alert('Failed to load product details.');
      navigate('/agent-dashboard/report-page');
    }
  };

  const updateSubcategories = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  const startQuestionnaire = () => {
    if (!selectedCategory || !selectedSubcategory) {
      alert('Please select both a category and subcategory to continue.');
      return;
    }
    setScreen('chat');
    fetchNextQuestion();
  };

  const handleStartRecording = async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        setAudioChunks([]);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks((prev) => [...prev, event.data]);
          }
        };

        recorder.onstop = () => {
          if (audioChunks.length === 0) {
            alert('No audio recorded.');
            return;
          }
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'voice_input.wav', { type: 'audio/wav' });
          setRecordingStatus('Uploading voice...');
          fetchNextQuestion(null, audioFile);
          setRecordingStatus('');
        };

        recorder.start();
        setIsRecording(true);
        setRecordingStatus('Recording... Click again to stop.');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Microphone access denied or unavailable.');
      }
    } else if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const fetchNextQuestion = async (userResponse: string | null = null, file: File | null = null) => {
    setFadeClass('fade-out');
    setIsLoading(true);
    setSpinnerText('Validating...');

    setTimeout(() => {
      setSpinnerText('Generating next question...');
    }, 750);

    setTimeout(async () => {
      let fetchOptions: RequestInit = {
        method: 'POST',
      };

      if (userResponse || file) {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        if (userResponse) formData.append('user_response', userResponse);
        if (file) formData.append('file', file);
        if (effectiveProductId) formData.append('product_id', effectiveProductId.toString());
        fetchOptions.body = formData;
      } else {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify({
          session_id: sessionId,
          category: selectedCategory,
          sub_categories: [selectedSubcategory],
          product_id: effectiveProductId,
        });
      }

      try {
        const res = await fetch('https://chatsystem-xudw.onrender.com/chats', fetchOptions);
        const data = await res.json();
        setResponseText('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(false);

        if (data.completed) {
          setScreen('result');
          setAnswers(data.answers.map((ans: string, idx: number) => ({ question: `Q${idx + 1}`, response: ans })));
          setReport(data.report);
          localStorage.setItem('summaryReport', data.report);
          localStorage.setItem('summaryAnswers', JSON.stringify(data.answers));
          if (effectiveProductId) {
            await api.post('/api/submit-intake-form', { productId: effectiveProductId });
          }
        } else if (data.message) {
          setCurrentQuestion(data.message);
          setQuestionText(data.message);
          setFadeClass('fade-in');
          if (userResponse || file) {
            setAnswers((prev) => [
              ...prev,
              { question: data.message, response: userResponse || '[File Uploaded]' },
            ]);
          }
          setTimeout(() => setFadeClass(''), 500);
        }
      } catch (err) {
        setIsLoading(false);
        console.error('Error:', err);
        alert('Failed to connect to the server. Make sure the backend is running.');
      }
    }, 1500);
  };

  const submitResponse = (e: FormEvent) => {
    e.preventDefault();
    if (!responseText && !file) {
      alert('Please enter a response or upload a file.');
      return;
    }
    const formData = new FormData();
    formData.append('session_id', sessionId);
    if (responseText) formData.append('user_response', responseText);
    if (file) formData.append('file', file);
    if (effectiveProductId) formData.append('product_id', effectiveProductId.toString());
    fetchNextQuestion(null, file);
  };

  const restart = () => {
    localStorage.clear();
    navigate('/agent-dashboard/report-page');
  };

  return (
    <div className="min-h-screen flex justify-center p-5 bg-gradient-to-r from-cyan-100 to-purple-200">
      {screen === 'category' && (
        <div className="container flex flex-col w-full max-w-[600px] bg-white rounded-2xl p-5 shadow-lg h-[90vh] overflow-y-auto">
          <h1 className="text-2xl text-gray-800 mb-5 text-center">Questionnaire</h1>
          <p className="text-center mb-5">Please select a category and subcategory to begin:</p>
          <div className="mb-5">
            <label htmlFor="category" className="block mb-2">Category:</label>
            <select
              id="category"
              className="w-full p-3 mb-4 text-base border border-gray-300 rounded-lg bg-gray-50 focus:border-purple-700"
              onChange={updateSubcategories}
              value={selectedCategory}
            >
              <option value="">Select a category</option>
              <option value="food">food</option>
              <option value="clothing">clothing</option>
              <option value="cosmetics">cosmetics</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Animal-fodder">Animal-fodder</option>
            </select>
          </div>
          <div className="mb-5">
            <label htmlFor="subcategory" className="block mb-2">Subcategory:</label>
            <select
              id="subcategory"
              className="w-full p-3 mb-4 text-base border border-gray-300 rounded-lg bg-gray-50 focus:border-purple-700"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              <option value="">Select a subcategory</option>
              {selectedCategory &&
                subcategories[selectedCategory]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="bg-purple-700 text-white border-none p-3 rounded-lg cursor-pointer text-base mt-2 w-full hover:bg-purple-800"
            onClick={startQuestionnaire}
          >
            Start Questionnaire
          </button>
        </div>
      )}

      {screen === 'chat' && (
        <div className="container flex flex-col w-full max-w-[600px] bg-white rounded-2xl p-5 shadow-lg h-[90vh] overflow-y-auto">
          <h1 className="text-2xl text-gray-800 mb-5 text-center">Questionnaire</h1>
          <p id="question-text" className={`text-lg mb-5 text-gray-800 text-center transition-opacity duration-500 ${fadeClass}`}>
            {questionText}
          </p>
          {isLoading && (
            <div className="flex flex-col items-center mb-5">
              <div className="spinner border-4 border-gray-200 border-t-purple-700 rounded-full w-10 h-10 animate-spin mb-2"></div>
              <p className="text-sm text-gray-600">{spinnerText}</p>
            </div>
          )}
          <form onSubmit={submitResponse} className="mb-5">
            <input
              type="text"
              className="w-full p-3 mb-4 text-base border border-gray-300 rounded-lg bg-gray-50 focus:border-purple-700"
              placeholder="Type your answer..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="w-full p-3 mb-4 text-base border border-gray-300 rounded-lg bg-gray-50"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
            <button
              type="submit"
              className="bg-purple-700 text-white border-none p-3 rounded-lg cursor-pointer text-base w-full hover:bg-purple-800"
            >
              Submit
            </button>
          </form>
          <button
            className="bg-purple-700 text-white border-none p-3 rounded-lg cursor-pointer text-base mb-5 w-full hover:bg-purple-800"
            onClick={handleStartRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <p className="mb-5">{recordingStatus}</p>
          <div className="max-h-[300px] overflow-y-auto">
            {answers.map((ans, idx) => (
              <div key={idx} className="answered-question text-left mt-2">
                <strong>{ans.question}</strong>
                <br />
                Answer: {ans.response}
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'result' && (
        <div className="container flex flex-col w-full max-w-[600px] bg-white rounded-2xl p-5 shadow-lg h-[90vh] overflow-y-auto">
          <h3 className="text-xl text-gray-800 mb-5 text-center">Thank you for your responses!</h3>
          <ul className="list-none p-0">
            {answers.map((ans, idx) => (
              <li key={idx} className="bg-gray-100 m-1 p-2 rounded-md text-left">
                {ans.question}: {ans.response}
              </li>
            ))}
          </ul>
          <pre className="bg-gray-100 p-4 rounded-md mt-2 text-left whitespace-pre-wrap break-words text-sm">
            {report}
          </pre>
          <button
            className="bg-purple-700 text-white border-none p-3 rounded-lg cursor-pointer text-base mt-5 w-full hover:bg-purple-800"
            onClick={restart}
          >
            Back to Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;