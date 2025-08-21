import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LearningRoadmap({ analysisText, jobDescription, onClose }) {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedPhases, setCompletedPhases] = useState({});
  const navigate = useNavigate();

  const generateRoadmap = async () => {
    if (!analysisText) {
      alert("No analysis data available!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis: analysisText,
          jobDescription: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setRoadmapData(data.roadmap);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("An error occurred while generating the roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = (phaseTitle) => {
    setCompletedPhases((prev) => ({ ...prev, [phaseTitle]: true }));
    navigate(`/quiz/${encodeURIComponent(phaseTitle)}`); // redirect to quiz page
  };

  const RoadmapCard = ({ phase, title, duration, skills, resources }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center mb-4">
        <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
          {phase}
        </span>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
        {completedPhases[title] && (
          <span className="ml-auto text-green-600 font-semibold">✅ Completed</span>
        )}
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Skills to Learn:</h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Free Resources:</h4>
        <div className="space-y-2">
          {resources.map((resource, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-red-500 mr-2">📺</span>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex-1"
              >
                {resource.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    
    {!completedPhases[title] && (
      <button
        onClick={() => markComplete(title)}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        ✅ Mark as Complete & Take Quiz
      </button>
    )}
  </div>
);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">🗺️ Your Personalized Learning Roadmap</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!roadmapData ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-700 mb-4">Generate Your Learning Path</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Based on your skill gap analysis, we'll create a personalized roadmap with free resources 
                and step-by-step guidance to land your dream job.
              </p>
              <button
                onClick={generateRoadmap}
                disabled={loading}
                className={`px-8 py-4 rounded-full transition duration-300 shadow-md ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {loading ? "🔄 Generating Roadmap..." : "🚀 Generate Learning Roadmap"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-green-800">Roadmap Generated Successfully!</h4>
                    <p className="text-green-600 text-sm">Follow this step-by-step plan to bridge your skill gaps</p>
                  </div>
                </div>
              </div>

              {/* Roadmap Phases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roadmapData.phases && roadmapData.phases.map((phase, index) => (
                  <RoadmapCard
                    key={index}
                    phase={phase.phase}
                    title={phase.title}
                    duration={phase.duration}
                    skills={phase.skills}
                    resources={phase.resources}
                  />
                ))}
              </div>

              {/* Additional Tips */}
              {roadmapData.additionalTips && roadmapData.additionalTips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Additional Tips</h3>
                  <ul className="space-y-2">
                    {roadmapData.additionalTips.map((tip, idx) => (
                      <li key={idx} className="text-yellow-700 flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🖨️ Print Roadmap
                </button>
                <button
                  onClick={generateRoadmap}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}