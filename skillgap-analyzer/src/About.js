import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600">About CareerCompass</h1>
        <p className="mt-6 text-lg text-gray-700 leading-relaxed">
          CareerCompass is an AI-powered platform designed to help freshers identify and bridge
          the skills required for their dream jobs. By analyzing your resume and comparing it with
          job descriptions, our system provides a detailed skill gap analysis and generates a
          personalized learning roadmap.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-blue-600">Our Mission</h3>
          <p className="mt-3 text-gray-600">
            To empower freshers by providing them with actionable insights and roadmaps to become
            industry-ready and confident in their job search journey.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-blue-600">How It Works</h3>
          <p className="mt-3 text-gray-600">
            Upload your resume, select your target role, and let our AI analyze your skills,
            certifications, and projects against job requirements. Get a personalized plan instantly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-blue-600">Why Choose Us?</h3>
          <p className="mt-3 text-gray-600">
            Our platform blends AI-driven analysis with curated learning recommendations, making it
            easier than ever to upskill and track progress effectively.
          </p>
        </div>
      </div>
    </div>
  );
}
