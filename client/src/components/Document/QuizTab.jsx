import { useState, useCallback } from 'react';
import * as api from '../../services/api';

export default function QuizTab({ document }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('mcq'); // mcq, flashcard, interview
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateQuiz(document.id);
      setQuiz(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [document.id]);

  const handleAnswer = (index) => {
    if (answered.has(currentQ)) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnswered(prev => new Set(prev).add(currentQ));
    if (index === quiz.mcqs[currentQ].correct_index) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQ(prev => Math.min(prev + 1, quiz.mcqs.length - 1));
  };

  const toggleFlip = (i) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Generating quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={generate} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Retry</button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Quiz Mode</h3>
        <p className="text-sm text-gray-500 mb-6">Test your understanding with AI-generated questions</p>
        <button onClick={generate} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          Generate Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'mcq', label: '📝 MCQs', count: quiz.mcqs?.length },
          { id: 'flashcard', label: '🃏 Flashcards', count: quiz.flashcards?.length },
          { id: 'interview', label: '🎙️ Interview', count: quiz.interview_questions?.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              mode === tab.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label} ({tab.count || 0})
          </button>
        ))}
      </div>

      {/* MCQ Mode */}
      {mode === 'mcq' && quiz.mcqs && (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Question {currentQ + 1} of {quiz.mcqs.length}</span>
            <span className="text-sm font-semibold text-primary">Score: {score}/{answered.size}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / quiz.mcqs.length) * 100}%` }} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">{quiz.mcqs[currentQ].question}</h3>
            <div className="space-y-3">
              {quiz.mcqs[currentQ].options.map((option, i) => {
                const isCorrect = i === quiz.mcqs[currentQ].correct_index;
                const isSelected = selectedAnswer === i;
                const hasAnswered = answered.has(currentQ);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      hasAnswered
                        ? isCorrect
                          ? 'border-green-400 bg-green-50 text-green-800'
                          : isSelected
                            ? 'border-red-400 bg-red-50 text-red-800'
                            : 'border-gray-200 text-gray-600'
                        : 'border-gray-200 hover:border-primary hover:bg-primary-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                    {hasAnswered && isCorrect && <span className="ml-2">✓</span>}
                    {hasAnswered && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 animate-fade-in">
                <span className="font-semibold">Explanation: </span>
                {quiz.mcqs[currentQ].explanation}
              </div>
            )}

            {answered.has(currentQ) && currentQ < quiz.mcqs.length - 1 && (
              <button onClick={nextQuestion} className="mt-4 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                Next Question →
              </button>
            )}

            {answered.size === quiz.mcqs.length && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl text-center">
                <p className="text-lg font-bold text-primary">Quiz Complete! 🎉</p>
                <p className="text-sm text-gray-600 mt-1">You scored {score} out of {quiz.mcqs.length}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flashcard Mode */}
      {mode === 'flashcard' && quiz.flashcards && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quiz.flashcards.map((card, i) => (
            <div
              key={i}
              onClick={() => toggleFlip(i)}
              className="flashcard-container h-48 cursor-pointer"
            >
              <div className={`flashcard-inner w-full h-full ${flippedCards.has(i) ? 'flipped' : ''}`}>
                <div className="flashcard-front w-full h-full bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Question</p>
                  <p className="text-center font-medium text-gray-900">{card.front}</p>
                  <p className="text-xs text-gray-400 mt-4">Click to flip</p>
                </div>
                <div className="flashcard-back w-full h-full bg-primary-50 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center">
                  <p className="text-xs text-primary uppercase tracking-wider mb-2">Answer</p>
                  <p className="text-center text-sm text-gray-800 leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview Mode */}
      {mode === 'interview' && quiz.interview_questions && (
        <div className="space-y-4">
          {quiz.interview_questions.map((q, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 card-hover">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-primary-50 text-primary rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                  {i + 1}
                </span>
                <p className="text-gray-800 font-medium">{q}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
