import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, QuizState } from '../types';
import { CheckCircle, XCircle, Brain, ArrowRight, RotateCcw } from 'lucide-react';

const topics = ['Basic Greetings', 'Food & Dining', 'Travel Essentials', 'Numbers & Time', 'Common Verbs'];

const QuizArena: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    isFinished: false,
    isLoading: false,
    selectedAnswer: null
  });

  const [setupMode, setSetupMode] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);

  const startQuiz = async () => {
    setSetupMode(false);
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    const questions = await generateQuiz(selectedTopic, 'Beginner');
    
    setGameState({
        questions,
        currentQuestionIndex: 0,
        score: 0,
        isFinished: false,
        isLoading: false,
        selectedAnswer: null
    });
  };

  const handleAnswer = (index: number) => {
    if (gameState.selectedAnswer !== null) return; // Prevent multi-click

    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = index === currentQ.correctAnswerIndex;

    setGameState(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        selectedAnswer: index
    }));
  };

  const nextQuestion = () => {
    const isLast = gameState.currentQuestionIndex === gameState.questions.length - 1;
    if (isLast) {
        setGameState(prev => ({ ...prev, isFinished: true }));
    } else {
        setGameState(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            selectedAnswer: null
        }));
    }
  };

  const resetQuiz = () => {
    setSetupMode(true);
    setGameState({
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        isFinished: false,
        isLoading: false,
        selectedAnswer: null
    });
  };

  if (setupMode) {
      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-sweden-yellow/10 rounded-full flex items-center justify-center mx-auto text-sweden-yellow">
                    <Brain size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white">Quiz Arena</h2>
                <p className="text-slate-400">Choose a topic and let Sven generate a unique challenge for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map(topic => (
                    <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`p-6 rounded-xl border text-left transition-all ${
                            selectedTopic === topic 
                            ? 'bg-sweden-blue border-sweden-blue text-white shadow-lg shadow-sweden-blue/20' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sweden-blue/50'
                        }`}
                    >
                        <span className="font-semibold">{topic}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={startQuiz}
                    className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors flex items-center space-x-2"
                >
                    <span>Start Quiz</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
      );
  }

  if (gameState.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-16 h-16 border-4 border-sweden-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Generating questions...</p>
        </div>
      );
  }

  if (gameState.isFinished) {
      return (
          <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
             <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                 <p className="text-slate-400 mb-2">Your Score</p>
                 <div className="text-5xl font-black text-sweden-yellow mb-2">
                     {gameState.score} / {gameState.questions.length}
                 </div>
                 <p className="text-sm text-slate-500">
                    {gameState.score === gameState.questions.length ? "Utmärkt! (Excellent!)" : "Bra jobbat! (Good job!)"}
                 </p>
             </div>
             <button
                onClick={resetQuiz}
                className="flex items-center justify-center space-x-2 w-full py-4 bg-sweden-blue text-white rounded-xl hover:bg-sweden-dark transition-colors"
             >
                 <RotateCcw size={20} />
                 <span>Try Another Topic</span>
             </button>
          </div>
      );
  }

  const currentQ = gameState.questions[gameState.currentQuestionIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-8 text-sm font-medium text-slate-400">
            <span>Topic: {selectedTopic}</span>
            <span>Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}</span>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                {currentQ.question}
            </h3>

            <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                    let btnClass = "bg-slate-700/50 border-slate-600 hover:bg-slate-700";
                    
                    if (gameState.selectedAnswer !== null) {
                        if (idx === currentQ.correctAnswerIndex) {
                            btnClass = "bg-green-500/20 border-green-500 text-green-200";
                        } else if (idx === gameState.selectedAnswer) {
                            btnClass = "bg-red-500/20 border-red-500 text-red-200";
                        } else {
                            btnClass = "bg-slate-800/50 border-slate-700 opacity-50";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={gameState.selectedAnswer !== null}
                            className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${btnClass}`}
                        >
                            <span className="font-medium text-lg">{option}</span>
                            {gameState.selectedAnswer !== null && idx === currentQ.correctAnswerIndex && (
                                <CheckCircle className="text-green-500" />
                            )}
                            {gameState.selectedAnswer === idx && idx !== currentQ.correctAnswerIndex && (
                                <XCircle className="text-red-500" />
                            )}
                        </button>
                    )
                })}
            </div>

            {gameState.selectedAnswer !== null && (
                <div className="mt-8 p-4 bg-sweden-blue/10 rounded-xl border border-sweden-blue/20 animate-in fade-in">
                    <p className="font-semibold text-sweden-blue mb-1">Explanation:</p>
                    <p className="text-slate-300">{currentQ.explanation}</p>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={nextQuestion}
                            className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            {gameState.currentQuestionIndex === gameState.questions.length - 1 ? "Finish" : "Next Question"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default QuizArena;
