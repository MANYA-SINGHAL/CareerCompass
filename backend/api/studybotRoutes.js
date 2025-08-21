// studybotRoutes.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory storage for sessions
const userSessions = new Map();

// Core personality definition
const ALEX_PERSONALITY = `
You are Alex, an enthusiastic and supportive AI study buddy helping someone learn programming and get their first tech job.

Personality traits:
- Encouraging and motivational, but realistic
- Friendly and approachable, like talking to a good friend
- Uses emojis occasionally (1-2 per message max)
- Celebrates small wins and progress
- Asks engaging follow-up questions
- Provides specific, actionable advice
- Remembers past context
- Keeps responses conversational and under 150 words

Expertise areas:
- Programming languages (JavaScript, Python, HTML/CSS, React, etc.)
- Learning roadmaps and career advice
- Project ideas and coding practice
- Interview preparation
- Motivation and overcoming coding challenges
`;

// ==================== CHAT ENDPOINT ==================== //
router.post("/chat", async (req, res) => {
  try {
    const { message, userId = 'demo-user' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Load or create session
    let session = userSessions.get(userId) || {
      userId,
      conversationHistory: [],
      messageCount: 0,
      startTime: new Date(),
      goals: null, // User's learning goals
      lastCheckMessageCount: 0
    };

    // Detect and store learning goals if mentioned
    if (!session.goals && /goal|learn|aim|target/i.test(message)) {
      session.goals = message;
    }

    // Milestone celebration logic
    let milestoneMessage = null;
    if (session.messageCount === 4) {
      milestoneMessage = "🎉 Woohoo! We’ve hit our first 5 messages — love your dedication!";
    } else if (session.messageCount === 9) {
      milestoneMessage = "🔥 10 messages already! You’re really staying engaged!";
    }
    const minutesSinceStart = Math.floor((new Date() - session.startTime) / 60000);
    if (minutesSinceStart === 60) {
      milestoneMessage = "⏳ 1 hour of focused learning — amazing commitment!";
    }
    if (milestoneMessage) {
      session.conversationHistory.push({
        sender: "alex",
        message: milestoneMessage,
        timestamp: new Date()
      });
    }

    // Build prompt with personality and context
    const prompt = buildStudyBuddyPrompt(message, session);

    // Get AI response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Save conversation
    session.messageCount += 1;
    session.conversationHistory.push(
      { sender: 'user', message, timestamp: new Date() },
      { sender: 'alex', message: aiResponse, timestamp: new Date() }
    );

    // Keep history short
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }

    // Save session
    userSessions.set(userId, session);

    res.json({ 
      response: aiResponse,
      milestone: milestoneMessage,
      messageCount: session.messageCount
    });

  } catch (error) {
    console.error("Error in study buddy chat:", error);
    res.status(500).json({ 
      response: "Oops! I'm having trouble thinking right now. Can you try again? 🤖",
      error: "AI_ERROR"
    });
  }
});

// ==================== PROACTIVE CHECK-IN ENDPOINT ==================== //
router.get("/checkin/:userId", (req, res) => {
  const { userId } = req.params;
  const session = userSessions.get(userId);

  if (!session) {
    return res.json({ message: null });
  }

  const now = new Date();
  const hoursSinceLastCheck = session.lastCheckTime
    ? (now - session.lastCheckTime) / (1000 * 60 * 60)
    : Infinity;

  const messagesSinceLastCheck = session.messageCount - (session.lastCheckMessageCount || 0);

  // Check-in every 6 hours OR after 20 messages without check-in
  if (hoursSinceLastCheck >= 6 || messagesSinceLastCheck >= 20) {
    session.lastCheckTime = now;
    session.lastCheckMessageCount = session.messageCount;
    userSessions.set(userId, session);

    return res.json({
      message: `Hey there! 🌟 It's been a while since we last talked. How's your learning journey going?`
    });
  }

  res.json({ message: null });
});


// ==================== HEALTH CHECK ==================== //
router.get("/health", (req, res) => {
  res.json({ 
    status: "online", 
    message: "Alex the Study Buddy is ready to help!",
    activeSessions: userSessions.size
  });
});

// ==================== SESSION INFO (DEBUG) ==================== //
router.get("/session/:userId", (req, res) => {
  const { userId } = req.params;
  const session = userSessions.get(userId);
  
  if (!session) {
    return res.json({ message: "No active session found" });
  }
  
  res.json({
    goals: session.goals,
    messageCount: session.messageCount,
    startTime: session.startTime,
    conversationLength: session.conversationHistory.length
  });
});

// ==================== PROMPT BUILDER ==================== //
function buildStudyBuddyPrompt(userMessage, session) {
  const conversationContext = session.conversationHistory
    .slice(-6)
    .map(msg => `${msg.sender}: ${msg.message}`)
    .join('\n');

  return `
${ALEX_PERSONALITY}

User's learning goals: ${session.goals || "Not set yet. Ask the user about them."}

Conversation so far:
${conversationContext || 'This is the start of our conversation.'}

Total messages exchanged: ${session.messageCount}

User says: "${userMessage}"

Respond as Alex would — be helpful, encouraging, and move the conversation forward with a question or suggestion.
`;
}

module.exports = router;
