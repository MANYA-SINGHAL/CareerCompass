// src/App.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import About from "./About";
import ResumeUpload from "./ResumeUpload";
import Chatbot from "./chatbot";
import Quiz from "./quiz";


function Home() {
  return(
  <>
   {/* Hero Section */}
   <section className="flex flex-col items-center text-center px-6 mt-16">
   <h2 className="text-4xl font-bold text-gray-800 leading-snug">
     Close Your <span className="text-blue-600">Skill Gaps</span> & Land Your Dream Job
   </h2>
   <p className="mt-4 text-lg text-gray-600 max-w-2xl">
     Upload your resume and target job description. Let us analyze your skill gaps 
     and create a personalized roadmap to make you job-ready.
   </p>
   <Link to="/upload" className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700">
     Get Started for Free
   </Link>
   <img 
     src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d" 
     alt="CareerCompass" 
     className="mt-10 w-full max-w-4xl rounded-xl shadow-lg"
   />
 </section>

 {/* Features Section */}
 <section id="features" className="mt-20 px-6">
   <h3 className="text-3xl font-bold text-center text-gray-800">Features</h3>
   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
     <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
       <h4 className="text-xl font-semibold text-blue-600">AI Resume Analysis</h4>
       <p className="mt-2 text-gray-600">
         Our NLP engine extracts and compares your skills with your dream job's requirements.
       </p>
     </div>
     <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
       <h4 className="text-xl font-semibold text-blue-600">Personalized Roadmap</h4>
       <p className="mt-2 text-gray-600">
         Get an AI-generated step-by-step learning path with courses, certifications, and projects.
       </p>
     </div>
     <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
       <h4 className="text-xl font-semibold text-blue-600">Progress Tracking</h4>
       <p className="mt-2 text-gray-600">
         Visual dashboards and reminders help you stay on track with your skill-building journey.
       </p>
     </div>
   </div>
 </section>
 </>
 );
}


// ✅ Wrapper to read topic from URL and pass to Quiz
function QuizPage() {
  const { topic } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Milestone Quiz: {topic}</h1>
      <Quiz topic={topic} onComplete={(score) => console.log("User scored:", score)} />
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Router>
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">CareerCompass</h1>
        <div className="space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">Get Started</Link>
        </div>
      </nav>
      {/* Routes */}
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/upload" element={<ResumeUpload />} />
    <Route path="/quiz/:topic" element={<QuizPage />} />
    </Routes>
     {/* ✅ Chatbot - Always available */}
     <Chatbot />
      </Router>

      {/* Footer */}
      <footer className="mt-20 bg-white shadow-inner p-6 text-center">
        <p className="text-gray-600">&copy; 2025 CareerCompass. All rights reserved.</p>
      </footer>
    </div>

  );
}
