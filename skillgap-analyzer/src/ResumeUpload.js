import React, { useState } from "react";
import LearningRoadmap from "./roadmap"; // Import the separate component

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Clean markdown symbols and unnecessary formatting
  const cleanText = (text) => {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/(__([^_]+)__|_([^_]+)_)/g, '$2$3')
      .replace(/^[\s]*[-\*\+]\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const formatAnalysisText = (text) => {
    if (!text) return null;
    const cleanedText = cleanText(text);
    const segments = cleanedText.split(/(?:\r?\n){2,}|\. (?=[A-Z])/);
    
    return segments.map((segment, index) => {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) return null;

      if (trimmedSegment.match(/^(Matching|Missing|Recommendations?|Overall|Summary|Analysis|Skills?|Gap)/i)) {
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-bold text-blue-700 mb-3 pb-2 border-b border-blue-200 flex items-center">
              {getSectionIcon(trimmedSegment)}
              <span className="ml-2">{trimmedSegment}</span>
            </h3>
          </div>
        );
      }

      if (trimmedSegment.match(/\d+%/)) {
        const percentMatch = trimmedSegment.match(/(\d+)%/);
        return (
          <div key={index} className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg my-4 text-white text-center">
            <div className="text-2xl font-bold">{percentMatch[1]}%</div>
            <div className="text-sm opacity-90">Overall Match</div>
          </div>
        );
      }

      if (trimmedSegment.includes(',') && trimmedSegment.split(',').length > 2) {
        const items = trimmedSegment.split(',').map(item => item.trim());
        const intro = items[0].includes(':') ? items.shift() : '';
        
        return (
          <div key={index} className="mb-4">
            {intro && <p className="font-semibold text-gray-800 mb-2">{intro}</p>}
            <div className="bg-gray-50 p-4 rounded-lg">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start mb-2 last:mb-0">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{item.replace(/^and\s+/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      const isImportant = trimmedSegment.match(/(recommend|suggest|should|important|critical|key|significant)/i);
      const isPositive = trimmedSegment.match(/(good|excellent|strong|matches|qualified|suitable)/i);
      const isNegative = trimmedSegment.match(/(lack|missing|weak|gap|need|require|absent)/i);

      let bgColor = 'bg-white';
      let borderColor = 'border-gray-200';
      let textColor = 'text-gray-700';

      if (isImportant) {
        bgColor = 'bg-yellow-50';
        borderColor = 'border-yellow-300';
      } else if (isPositive) {
        bgColor = 'bg-green-50';
        borderColor = 'border-green-300';
      } else if (isNegative) {
        bgColor = 'bg-red-50';
        borderColor = 'border-red-300';
      }

      return (
        <div key={index} className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4 shadow-sm`}>
          <p className={`${textColor} leading-relaxed`}>
            {highlightKeywords(trimmedSegment)}
          </p>
        </div>
      );
    }).filter(Boolean);
  };

  const getSectionIcon = (text) => {
    if (text.toLowerCase().includes('matching')) return '✅';
    if (text.toLowerCase().includes('missing')) return '❌';
    if (text.toLowerCase().includes('recommend')) return '💡';
    if (text.toLowerCase().includes('overall')) return '📊';
    if (text.toLowerCase().includes('summary')) return '📋';
    return '📌';
  };

  const highlightKeywords = (text) => {
    const keywords = [
      { regex: /(\d+\s*years?)/gi, className: 'bg-blue-100 text-blue-800 px-1 rounded' },
      { regex: /(Python|JavaScript|React|Node\.js|SQL|AWS|Docker|Kubernetes|Java|C\+\+|HTML|CSS)/gi, className: 'bg-purple-100 text-purple-800 px-1 rounded font-medium' },
      { regex: /(\d+%)/gi, className: 'bg-green-100 text-green-800 px-1 rounded font-bold' },
    ];

    let formattedText = text;
    
    keywords.forEach(({ regex, className }) => {
      formattedText = formattedText.replace(regex, (match) => 
        `<span class="${className}">${match}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const handleUpload = async () => {
    if (!file || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      setLoading(true);
      const response = await fetch("http://localhost:5050/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisText(data.analysis);
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("An error occurred while analyzing your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-6xl text-center border border-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-700">Resume Skill Gap Analyzer</h1>
        <p className="mt-3 text-gray-600">
          Upload your resume and write the target job description to find your skill gaps instantly.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          {/* Left Column - Upload and Job Description */}
          <div className="lg:col-span-2 space-y-4">
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition duration-300">
              <input type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={handleFileChange} />
              {file ? (
                <span className="text-gray-800 font-medium">{file.name}</span>
              ) : (
                <span className="text-gray-500">📄 Drag & Drop or Click to Upload</span>
              )}
            </label>

            <textarea
              className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Write the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-full transition duration-300 shadow-md ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "🔍 Analyzing..." : "Analyze Resume"}
            </button>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-3">
            {analysisText ? (
              <div className="text-left bg-gray-50 p-4 rounded-xl shadow-inner h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">📊 Skill Gap Analysis</h2>
                  <button
                    onClick={() => setShowRoadmap(true)}
                    className="px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition duration-300 shadow-md"
                  >
                    🗺️ Get Learning Roadmap
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {formatAnalysisText(analysisText)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-center">
                  Upload your resume and job description<br />to see the analysis here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Roadmap Modal */}
      {showRoadmap && (
        <LearningRoadmap 
          analysisText={analysisText}
          jobDescription={jobDescription}
          onClose={() => setShowRoadmap(false)}
        />
      )}
    </div>
  );
}