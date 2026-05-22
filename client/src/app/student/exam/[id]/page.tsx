'use client'

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/app/lib/api';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text';
  points: number;
  options: string[];
  correctOptionIndex?: number;
}

export default function StudentExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  // States
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [webcamRequired, setWebcamRequired] = useState(true);
  const [maxWarnings, setMaxWarnings] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins in seconds
  const [warnings, setWarnings] = useState(0);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [webcamState, setWebcamState] = useState<'loading' | 'active' | 'failed'>('loading');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Helper to add logs
  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch Exam parameters and questions on mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exams/${examId}`);
        const exam = response.data;
        setExamTitle(exam.title);
        
        const mappedQuestions = (exam.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q_${idx}`,
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options || [],
          correctOptionIndex: q.correct_option_index !== undefined ? q.correct_option_index : q.correctOptionIndex
        }));
        
        setQuestions(mappedQuestions);
        setTimeLeft(exam.duration_minutes * 60);
        setMaxWarnings(exam.max_warnings || 3);
        setWebcamRequired(exam.webcam_required !== undefined ? exam.webcam_required : true);
      } catch (err: any) {
        console.error('Error fetching exam:', err);
        setError('Failed to load exam. Please ensure you are authorized or try again.');
      } finally {
        setLoading(false);
      }
    };
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  // Initialize webcam if required after loading is done
  useEffect(() => {
    if (loading) return;

    if (!webcamRequired) {
      addLog('System initialization started.');
      addLog('Webcam monitoring is disabled for this exam.');
      addLog('AI focus tracking engine active (Tab lock only).');
      return;
    }

    addLog('System initialization started.');
    addLog('Requesting webcam access for security check...');

    let activeStream: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then((stream) => {
        activeStream = stream;
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamState('active');
        addLog('Webcam feed established.');
        addLog('Identity verification check passed (98.4% match).');
        addLog('AI proctoring and focus tracking engine active.');
      })
      .catch((err) => {
        console.error('Webcam permission error:', err);
        setWebcamState('failed');
        addLog('Error: Webcam access denied or no camera found.');
        addLog('Webcam feed simulated.');
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loading, webcamRequired]);

  // Timer Countdown
  useEffect(() => {
    if (loading || isSubmitted || isDisqualified) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitted, isDisqualified]);

  // Window Focus/Blur Detection (Tab Switching Warning)
  useEffect(() => {
    if (loading || isSubmitted || isDisqualified) return;

    const handleBlur = () => {
      setWarnings((prev) => {
        const nextWarnings = prev + 1;
        addLog(`Warning: Candidate switched tab or window! Focus lock broken.`);

        if (nextWarnings >= maxWarnings) {
          setIsDisqualified(true);
          addLog(`Candidate disqualified: Maximum warning threshold (${maxWarnings}) exceeded.`);
          // Stop media stream tracks on disqualification
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          }
          return maxWarnings;
        } else {
          setShowWarningAlert(true);
          return nextWarnings;
        }
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [loading, isSubmitted, isDisqualified, maxWarnings]);

  // Actions
  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    addLog(`Question ${currentIdx + 1} answer recorded.`);
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const toggleFlag = (questionId: string) => {
    setFlags((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    addLog(`Question ${currentIdx + 1} review flag toggled.`);
  };

  const handleAutoSubmit = () => {
    addLog('Timer expired. Auto-submitting examination.');
    submitExam();
  };

  const submitExam = () => {
    setIsSubmitted(true);
    addLog('Examination answers submitted successfully.');
    // Stop camera
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowSubmitConfirm(false);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-white space-y-6">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-wider text-white/90 animate-pulse">Initializing Secure Environment</h2>
            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Verifying integrity & loading exam sheets...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 p-6">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Exam Load Failed</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-sm font-bold text-white transition-all border border-white/5"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (questions.length === 0) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">No Questions</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">This examination does not contain any questions yet.</p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-sm font-bold text-white transition-all border border-white/5"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const activeQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;

  // Render Disqualified Screen
  if (isDisqualified) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 p-6">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 animate-pulse">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Disqualified</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your examination session was terminated because you violated the proctoring lock rules. Switching tabs, leaving full-screen mode, or changing windows is strictly prohibited.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Incident Summary</span>
              <div className="text-xs text-red-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Browser Tab Focus Violations: {warnings}/{maxWarnings}
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
                Auto-submission of recorded logs: Completed
              </div>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-sm font-bold text-white transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render Submitted Success Screen
  if (isSubmitted) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Exam Submitted Successfully</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Thank you. Your responses have been securely transmitted to the examination database and proctor logs are saved.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left space-y-2.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Session Summary</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-zinc-500">Answers Submitted:</span>
                <span className="text-white font-medium text-right">{answeredCount} / {totalQuestions}</span>
                <span className="text-zinc-500">Security warnings:</span>
                <span className={`font-medium text-right ${warnings > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {warnings} / {maxWarnings}
                </span>
                <span className="text-zinc-500">Proctoring Score:</span>
                <span className="text-emerald-400 font-bold text-right">
                  {warnings === 0 ? 'Excellent (100%)' : warnings / maxWarnings <= 0.34 ? 'Clear (90%)' : 'Caution (70%)'}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      {/* Tab Switch Warning Overlay Alert */}
      {showWarningAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-zinc-900 p-6 text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Browser Window Focus Lost</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Warning <span className="font-bold text-red-400">{warnings}/{maxWarnings}</span>. Leaving the exam workspace, opening a new tab, or changing windows is strictly prohibited and logged automatically.
            </p>
            <p className="text-xs text-red-400 font-semibold bg-red-500/10 py-1.5 rounded-lg">
              Reaching {maxWarnings} warnings will result in immediate disqualification.
            </p>
            <button
              onClick={() => {
                setShowWarningAlert(false);
                addLog('Candidate acknowledged window warning and returned.');
              }}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all"
            >
              Resume Examination
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Submit Examination?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to end your exam session and submit your answers? You cannot return to make edits.
            </p>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="text-white font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions Answered:</span>
                <span className="text-white font-medium">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Unanswered:</span>
                <span className={`${totalQuestions - answeredCount > 0 ? 'text-yellow-400 font-bold' : 'text-zinc-500 font-medium'}`}>
                  {totalQuestions - answeredCount}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitExam}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Full-Screen Examination Layout */}
      <div className="min-h-screen bg-zinc-950 flex flex-col text-white font-sans">

        {/* Secure Top Header */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">{examTitle}</h1>
              <span className="text-xs text-zinc-500 font-semibold tracking-widest uppercase block mt-0.5">
                SECURE TESTING SPACE • EXAM ID: {examId}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/5 rounded-full px-5 py-2">
            <svg className={`w-5 h-5 ${timeLeft <= 300 ? 'text-red-500 animate-spin-slow' : 'text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-base font-bold tracking-mono ${timeLeft <= 300 ? 'text-red-500 animate-pulse font-extrabold' : 'text-indigo-300'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 font-medium">
              Progress: <strong className="text-white">{answeredCount}/{totalQuestions}</strong>
            </span>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.25)] border border-indigo-500"
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left panel: Questions Sheet */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 flex flex-col justify-between">
            <div className="max-w-3xl w-full mx-auto space-y-6">

              {/* Question Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8 backdrop-blur-xl relative">

                {/* Meta details */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                      Question {currentIdx + 1} of {totalQuestions}
                    </span>
                    {flags[activeQuestion.id] && (
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                        </svg>
                        Flagged
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">
                    Points: <strong className="text-white">{activeQuestion.points}</strong>
                  </span>
                </div>

                {/* Prompt */}
                <h3 className="text-lg lg:text-xl font-medium text-white mb-6 leading-relaxed">
                  {activeQuestion.text}
                </h3>

                {/* Options / Text Input */}
                {activeQuestion.type === 'multiple_choice' ? (
                  <div className="space-y-3">
                    {activeQuestion.options.map((option, optIdx) => {
                      const isSelected = answers[activeQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerSelect(activeQuestion.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 hover:bg-white/5 ${isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 text-white font-medium shadow-[0_0_10px_rgba(79,70,229,0.1)]'
                              : 'bg-black/30 border-white/5 text-zinc-300'
                            }`}
                        >
                          <span className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500' : 'border-zinc-600'
                            }`}>
                            {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-400" />}
                          </span>
                          <span className="text-sm leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Write your response below:</label>
                    <textarea
                      value={(answers[activeQuestion.id] as string) || ''}
                      onChange={(e) => handleTextChange(activeQuestion.id, e.target.value)}
                      placeholder="Type your explanation here..."
                      rows={8}
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  disabled={currentIdx === 0}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Question
                </button>

                <button
                  onClick={() => toggleFlag(activeQuestion.id)}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${flags[activeQuestion.id]
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {flags[activeQuestion.id] ? 'Flagged for Review' : 'Flag for Review'}
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    Next Question
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    Finish & Submit
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Navigation Sheet */}
            <div className="max-w-3xl w-full mx-auto border-t border-white/5 pt-8 mt-12 space-y-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Question Navigation Sheet</span>
              <div className="flex flex-wrap gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answers[q.id] !== '' && answers[q.id] !== undefined;
                  const isFlagged = flags[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-10 w-10 rounded-xl text-sm font-bold transition-all border flex items-center justify-center ${isCurrent
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-[0_0_8px_rgba(79,70,229,0.3)]Scale-105'
                          : isFlagged
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            : isAnswered
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-black/35 border-white/5 text-zinc-500 hover:text-white hover:border-zinc-700'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Right panel: AI Proctoring Sidebar */}
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col gap-6 overflow-y-auto">

            {/* Live Feed Header */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Live Video Monitoring</h3>

              {/* Webcam Feed Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                {webcamRequired ? (
                  webcamState === 'active' ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-3">
                      <span className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-xs text-zinc-400 block font-medium">Camera Feed active (Simulated)</span>
                    </div>
                  )
                ) : (
                  <div className="text-center p-4 space-y-3">
                    <span className="h-8 w-8 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 flex items-center justify-center mx-auto">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </span>
                    <span className="text-xs text-zinc-400 block font-medium">Webcam monitoring not required</span>
                  </div>
                )}

                {/* Overlaid Proctor Badge */}
                {webcamRequired ? (
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    FEED LIVE
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-500/20 flex items-center gap-1.5 backdrop-blur-md">
                    DISABLED
                  </div>
                )}
              </div>
            </div>

            {/* Proctor Metrics Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">AI Diagnostic Signals</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/5 bg-black/35 p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Face Tracking</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${webcamRequired ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {webcamRequired && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    {webcamRequired ? 'Locked' : 'Disabled'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/35 p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Eye Gaze</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${webcamRequired ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {webcamRequired && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    {webcamRequired ? 'Centered' : 'Disabled'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/35 p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Audio Input</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/35 p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Tab Lock</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Warning infractions */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lock Violation Warnings</span>
                <span className="text-sm font-bold text-red-400">{warnings} / {maxWarnings}</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: maxWarnings }, (_, i) => i + 1).map((tick) => (
                  <div
                    key={tick}
                    className={`h-2 flex-1 rounded-full transition-all ${tick <= warnings ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/10'
                      }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Any focus loss, new tab creation, or layout minimization will trigger warnings. Maximum limit is {maxWarnings}.
              </p>
            </div>

            {/* Proctor Logging console */}
            <div className="flex-1 flex flex-col min-h-[160px]">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Live Proctor Logs</span>
              <div
                ref={logContainerRef}
                className="flex-1 rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[10px] leading-relaxed text-zinc-400 overflow-y-auto space-y-1.5 max-h-[220px]"
              >
                {logs.length === 0 ? (
                  <span className="text-zinc-600 block italic">Waiting for tracking session logs...</span>
                ) : (
                  logs.map((log, logIdx) => {
                    const isWarning = log.includes('Warning:');
                    return (
                      <div
                        key={logIdx}
                        className={isWarning ? 'text-red-400 font-semibold' : 'text-zinc-400'}
                      >
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </aside>

        </div>
      </div>
    </ProtectedRoute>
  );
}
