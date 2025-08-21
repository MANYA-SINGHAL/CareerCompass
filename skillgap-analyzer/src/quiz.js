import React, { useState, useEffect } from "react";

export default function Quiz({ topic, onComplete }) {
  const [quiz, setQuiz] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic })
        });
        const data = await res.json();

        // Normalize AI response to { question, options, answer }
        const normalized = (data.questions || data.quiz || []).map(q => ({
          question: q.question || q.prompt,
          options: q.options || q.answers || [],
          answer: q.answer || q.correct_answer || q.correctAnswer
        }));

        setQuiz(normalized);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setQuiz([]); // fallback empty quiz
      }
    };
    fetchQuiz();
  }, [topic]);

  const handleNext = () => {
    if (selected === quiz[currentQ].answer) {
      setScore(prev => prev + 1);
    }

    setSelected(null);
    if (currentQ < quiz.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score + (selected === quiz[currentQ].answer ? 1 : 0));
    }
  };

  if (!quiz.length) {
    return <div className="p-4">⏳ Loading quiz...</div>;
  }

  if (isFinished) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg text-center">
        <h2 className="text-xl font-bold mb-4">🎉 Quiz Completed!</h2>
        <p className="text-lg">You scored {score} / {quiz.length}</p>
        {score > quiz.length * 0.7 ? (
          <p className="text-green-600 mt-2">🔥 Great job! Keep it up.</p>
        ) : (
          <p className="text-red-600 mt-2">💡 Review the material and try again.</p>
        )}
      </div>
    );
  }

  const q = quiz[currentQ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-semibold mb-4">
        Q{currentQ + 1}. {q.question}
      </h2>
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(opt)}
            className={`w-full text-left px-4 py-2 rounded-lg border ${
              selected === opt
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={!selected}
        className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {currentQ === quiz.length - 1 ? "Finish Quiz" : "Next"}
      </button>
    </div>
  );
}
