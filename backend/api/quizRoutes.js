const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const QUIZ_API_URL = "https://quizapi.io/api/v1/ai";

// POST /api/quiz/generate
router.post("/generate", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    // Build GET URL with dynamic topic
    const url = `${QUIZ_API_URL}?apiKey=${process.env.QUIZAPI_KEY}&limit=10&tags=${encodeURIComponent(topic)}`;

    const response = await fetch(url); // GET request
    if (!response.ok) {
      throw new Error(`QuizAPI.io error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Map API response to frontend format
    const quiz = data.map(q => ({
      question: q.question,
      options: [
        q.answers.answer_a,
        q.answers.answer_b,
        q.answers.answer_c,
        q.answers.answer_d
      ].filter(Boolean),
      answer: Object.entries(q.correct_answers)
        .find(([key, value]) => value === "true")?.[0]
        .replace("_correct", "")
        .replace("answer_", "")
        .toUpperCase() || ""
    }));

    res.json({ topic, quiz });
  } catch (err) {
    console.error("Quiz fetch error:", err);

    // Fallback: return a simple static quiz if API fails
    const fallbackQuiz = [
      {
        question: `Sample question for ${topic}`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "1"
      }
    ];
    res.json({ topic, quiz: fallbackQuiz });
  }
});

module.exports = router;
