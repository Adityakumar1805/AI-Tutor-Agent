import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './QuizUI.css';

function QuizUI({ documents }) {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setStatus('⚠️ Please enter a topic');
      return;
    }

    setStatus('🤖 Generating quiz...');
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const response = await axios.post(`${API_URL}/generate-quiz`, {
        topic,
        docId: selectedDocId,
        numQuestions: parseInt(numQuestions)
      });

      setQuiz({
        ...response.data,
        questions: response.data.questions || []
      });
      setStatus(`✅ Quiz generated with ${response.data.questions?.length || 0} questions`);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setStatus(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
    setStatus('📊 Quiz submitted! Review your results below.');
  };

  const getScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach(q => {
      const userAnswer = userAnswers[q.id]?.trim().toLowerCase();
      const correctAnswer = q.answer?.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  return (
    <div className="quiz-ui">
      <div className="quiz-header">
        <h2>📝 Generate Quiz</h2>
        <p>Create personalized quizzes from your study materials</p>
      </div>

      <div className="quiz-controls">
        <div className="input-group">
          <label>Topic:</label>
          <input
            type="text"
            placeholder="e.g., Arrays, Trigonometry, Photosynthesis..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateQuiz()}
          />
        </div>

        <div className="input-group">
          <label>Number of Questions:</label>
          <select value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
          </select>
        </div>

        {documents.length > 0 && (
          <div className="input-group">
            <label>Source Document (optional):</label>
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value || null)}
            >
              <option value="">All Documents</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.filename}</option>
              ))}
            </select>
          </div>
        )}

        <button className="generate-button" onClick={generateQuiz}>
          🎯 Generate Quiz
        </button>

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
            {status}
          </div>
        )}
      </div>

      {quiz && quiz.questions && (
        <div className="quiz-container">
          <div className="quiz-title">
            <h3>{quiz.topic || 'Generated Quiz'}</h3>
            {!showResults && (
              <button className="submit-button" onClick={submitQuiz}>
                📤 Submit Quiz
              </button>
            )}
            {showResults && (
              <div className="quiz-score">
                <span className="score-label">Score:</span>
                <span className="score-value">{getScore()}%</span>
              </div>
            )}
          </div>

          <div className="questions-list">
            {quiz.questions.map((question, idx) => {
              const userAnswer = userAnswers[question.id] || '';
              const isCorrect = showResults && userAnswer.trim().toLowerCase() === question.answer?.trim().toLowerCase();

              return (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Q{idx + 1}</span>
                    <span className="question-type">{question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
                    {showResults && (
                      <span className={`answer-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="question-text">{question.question}</p>

                  {question.type === 'mcq' ? (
                    <div className="options-list">
                      {question.options?.map((option, optIdx) => (
                        <label key={optIdx} className={`option-label ${showResults && option === question.answer ? 'correct-answer' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            disabled={showResults}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="short-answer-input"
                      placeholder="Type your answer here..."
                      value={userAnswer}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={showResults}
                      rows={3}
                    />
                  )}

                  {showResults && (
                    <div className="question-explanation">
                      <strong>Correct Answer:</strong> {question.answer}
                      {question.explanation && (
                        <>
                          <br />
                          <strong>Explanation:</strong> {question.explanation}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizUI;