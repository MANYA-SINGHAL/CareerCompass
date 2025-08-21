require("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");


// Import the Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? "https://careercompass-7jg1.onrender.com"  // Your deployed frontend URL
    : "http://localhost:3000"  // Local development
}));
app.use(express.json());
const quizRoutes = require("./api/quizRoutes");
app.use("/api/quiz", quizRoutes);

const PORT = process.env.PORT || 5050;

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Curated Database of Verified Free Learning Resources
const CURATED_RESOURCES = {
  // Frontend Development
  "html": [
    {
      title: "freeCodeCamp - Responsive Web Design",
      url: "https://www.freecodecamp.org/learn/responsive-web-design/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "MDN Web Docs - HTML Basics",
      url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "W3Schools - HTML Tutorial",
      url: "https://www.w3schools.com/html/",
      type: "tutorial",
      verified: true,
      rating: 4
    }
  ],
  "css": [
    {
      title: "freeCodeCamp - Responsive Web Design",
      url: "https://www.freecodecamp.org/learn/responsive-web-design/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "MDN Web Docs - CSS Basics",
      url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "CSS-Tricks - CSS Almanac",
      url: "https://css-tricks.com/almanac/",
      type: "reference",
      verified: true,
      rating: 5
    }
  ],
  "javascript": [
    {
      title: "freeCodeCamp - JavaScript Algorithms and Data Structures",
      url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "MDN Web Docs - JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "JavaScript.info - Modern JavaScript Tutorial",
      url: "https://javascript.info/",
      type: "tutorial",
      verified: true,
      rating: 5
    }
  ],
  "react": [
    {
      title: "React Official Tutorial",
      url: "https://react.dev/learn",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - Front End Development Libraries",
      url: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Codecademy - Learn React (Free Course)",
      url: "https://www.codecademy.com/learn/react-101",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "node": [
    {
      title: "Node.js Official Guides",
      url: "https://nodejs.org/en/docs/guides/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - APIs and Microservices",
      url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Node.js Tutorial - W3Schools",
      url: "https://www.w3schools.com/nodejs/",
      type: "tutorial",
      verified: true,
      rating: 4
    }
  ],
  "python": [
    {
      title: "Python.org Official Tutorial",
      url: "https://docs.python.org/3/tutorial/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - Scientific Computing with Python",
      url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Codecademy - Learn Python 3 (Free)",
      url: "https://www.codecademy.com/learn/learn-python-3",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "git": [
    {
      title: "Git Official Tutorial",
      url: "https://git-scm.com/docs/gittutorial",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "GitHub Git Handbook",
      url: "https://guides.github.com/introduction/git-handbook/",
      type: "guide",
      verified: true,
      rating: 4
    },
    {
      title: "Atlassian Git Tutorials",
      url: "https://www.atlassian.com/git/tutorials",
      type: "tutorial",
      verified: true,
      rating: 5
    }
  ],
  "sql": [
    {
      title: "W3Schools - SQL Tutorial",
      url: "https://www.w3schools.com/sql/",
      type: "tutorial",
      verified: true,
      rating: 4
    },
    {
      title: "SQLBolt - Interactive SQL Tutorial",
      url: "https://sqlbolt.com/",
      type: "interactive",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - Relational Database Course",
      url: "https://www.freecodecamp.org/learn/relational-database/",
      type: "course",
      verified: true,
      rating: 5
    }
  ],
  "data-analysis": [
    {
      title: "freeCodeCamp - Data Analysis with Python",
      url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Kaggle Learn - Data Science Courses",
      url: "https://www.kaggle.com/learn",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Pandas Official Documentation",
      url: "https://pandas.pydata.org/docs/user_guide/",
      type: "documentation",
      verified: true,
      rating: 4
    }
  ],
  "machine-learning": [
    {
      title: "Coursera - Machine Learning Course (Andrew Ng) - Free Audit",
      url: "https://www.coursera.org/learn/machine-learning",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Kaggle Learn - Machine Learning",
      url: "https://www.kaggle.com/learn/machine-learning",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Scikit-learn User Guide",
      url: "https://scikit-learn.org/stable/user_guide.html",
      type: "documentation",
      verified: true,
      rating: 4
    }
  ],
  "testing": [
    {
      title: "Jest - Getting Started",
      url: "https://jestjs.io/docs/getting-started",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Testing Library - React Testing",
      url: "https://testing-library.com/docs/react-testing-library/intro/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - Quality Assurance",
      url: "https://www.freecodecamp.org/learn/quality-assurance/",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "deployment": [
    {
      title: "Netlify - Deploy Static Sites",
      url: "https://www.netlify.com/",
      type: "platform",
      verified: true,
      rating: 5
    },
    {
      title: "Vercel - Frontend Deployment",
      url: "https://vercel.com/",
      type: "platform",
      verified: true,
      rating: 5
    },
    {
      title: "Railway - Full-stack Deployment",
      url: "https://railway.app/",
      type: "platform",
      verified: true,
      rating: 4
    },
    {
      title: "GitHub Pages - Static Site Hosting",
      url: "https://pages.github.com/",
      type: "platform",
      verified: true,
      rating: 4
    }
  ],

  // MOBILE DEVELOPMENT
  "react-native": [
    {
      title: "React Native Official Documentation",
      url: "https://reactnative.dev/docs/getting-started",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "freeCodeCamp - React Native Course",
      url: "https://www.freecodecamp.org/news/create-an-app-with-react-native/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Expo Documentation",
      url: "https://docs.expo.dev/",
      type: "documentation",
      verified: true,
      rating: 4
    }
  ],
  "flutter": [
    {
      title: "Flutter Official Documentation",
      url: "https://flutter.dev/docs",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Flutter Codelabs",
      url: "https://codelabs.developers.google.com/?cat=Flutter",
      type: "tutorial",
      verified: true,
      rating: 5
    },
    {
      title: "Dart Language Tour",
      url: "https://dart.dev/guides/language/language-tour",
      type: "documentation",
      verified: true,
      rating: 4
    }
  ],
  "swift": [
    {
      title: "Swift Official Documentation",
      url: "https://swift.org/documentation/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Apple Developer - Swift Playgrounds",
      url: "https://developer.apple.com/swift-playgrounds/",
      type: "interactive",
      verified: true,
      rating: 4
    },
    {
      title: "Codecademy - Learn Swift (Free)",
      url: "https://www.codecademy.com/learn/learn-swift",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "kotlin": [
    {
      title: "Kotlin Official Documentation",
      url: "https://kotlinlang.org/docs/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Android Developers - Kotlin Bootcamp",
      url: "https://developer.android.com/courses/kotlin-bootcamp/overview",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Codecademy - Learn Kotlin (Free)",
      url: "https://www.codecademy.com/learn/learn-kotlin",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "android": [
    {
      title: "Android Developer Documentation",
      url: "https://developer.android.com/docs",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Google Developer Training",
      url: "https://developers.google.com/training/android/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Android Basics in Kotlin - Google",
      url: "https://developer.android.com/courses/android-basics-kotlin/course",
      type: "course",
      verified: true,
      rating: 5
    }
  ],
  "ios": [
    {
      title: "Apple Developer Documentation",
      url: "https://developer.apple.com/documentation/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "SwiftUI Tutorials - Apple",
      url: "https://developer.apple.com/tutorials/swiftui",
      type: "tutorial",
      verified: true,
      rating: 5
    },
    {
      title: "Hacking with Swift - Free SwiftUI",
      url: "https://www.hackingwithswift.com/100/swiftui",
      type: "course",
      verified: true,
      rating: 4
    }
  ],

  // DEVOPS & CLOUD
  "docker": [
    {
      title: "Docker Official Documentation",
      url: "https://docs.docker.com/get-started/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Docker Curriculum",
      url: "https://docker-curriculum.com/",
      type: "tutorial",
      verified: true,
      rating: 5
    },
    {
      title: "Play with Docker",
      url: "https://labs.play-with-docker.com/",
      type: "interactive",
      verified: true,
      rating: 4
    }
  ],
  "kubernetes": [
    {
      title: "Kubernetes Official Documentation",
      url: "https://kubernetes.io/docs/tutorials/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Kubernetes the Hard Way",
      url: "https://github.com/kelseyhightower/kubernetes-the-hard-way",
      type: "tutorial",
      verified: true,
      rating: 5
    },
    {
      title: "Kubernetes Learning Path - Microsoft",
      url: "https://docs.microsoft.com/en-us/learn/paths/intro-to-kubernetes-on-azure/",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "aws": [
    {
      title: "AWS Free Tier",
      url: "https://aws.amazon.com/free/",
      type: "platform",
      verified: true,
      rating: 5
    },
    {
      title: "AWS Documentation",
      url: "https://docs.aws.amazon.com/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "AWS Training and Certification - Free",
      url: "https://www.aws.training/",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "azure": [
    {
      title: "Azure Documentation",
      url: "https://docs.microsoft.com/en-us/azure/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Microsoft Learn - Azure Fundamentals",
      url: "https://docs.microsoft.com/en-us/learn/paths/azure-fundamentals/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Azure Free Account",
      url: "https://azure.microsoft.com/en-us/free/",
      type: "platform",
      verified: true,
      rating: 4
    }
  ],
  "linux": [
    {
      title: "Linux Documentation Project",
      url: "https://tldp.org/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Linux Journey",
      url: "https://linuxjourney.com/",
      type: "tutorial",
      verified: true,
      rating: 5
    },
    {
      title: "OverTheWire - Bandit",
      url: "https://overthewire.org/wargames/bandit/",
      type: "interactive",
      verified: true,
      rating: 4
    }
  ],

  // CYBERSECURITY
  "cybersecurity": [
    {
      title: "OWASP Web Security Testing Guide",
      url: "https://owasp.org/www-project-web-security-testing-guide/",
      type: "guide",
      verified: true,
      rating: 5
    },
    {
      title: "Cybrary - Free Cybersecurity Training",
      url: "https://www.cybrary.it/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "SANS Cyber Aces",
      url: "https://cyberaces.org/",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "ethical-hacking": [
    {
      title: "Metasploit Unleashed",
      url: "https://www.offensive-security.com/metasploit-unleashed/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "TryHackMe - Free Rooms",
      url: "https://tryhackme.com/",
      type: "platform",
      verified: true,
      rating: 5
    },
    {
      title: "PentesterLab - Free Exercises",
      url: "https://pentesterlab.com/exercises/",
      type: "interactive",
      verified: true,
      rating: 4
    }
  ],
  "penetration-testing": [
    {
      title: "OWASP Testing Guide",
      url: "https://owasp.org/www-project-web-security-testing-guide/",
      type: "guide",
      verified: true,
      rating: 5
    },
    {
      title: "Kali Linux Documentation",
      url: "https://www.kali.org/docs/",
      type: "documentation",
      verified: true,
      rating: 4
    },
    {
      title: "VulnHub - Practice VMs",
      url: "https://www.vulnhub.com/",
      type: "platform",
      verified: true,
      rating: 5
    }
  ],

  // UI/UX DESIGN
  "ui-design": [
    {
      title: "Google Design",
      url: "https://design.google/",
      type: "resource",
      verified: true,
      rating: 5
    },
    {
      title: "Material Design Guidelines",
      url: "https://material.io/design/",
      type: "guide",
      verified: true,
      rating: 5
    },
    {
      title: "Figma Academy",
      url: "https://www.figma.com/academy/",
      type: "course",
      verified: true,
      rating: 4
    }
  ],
  "ux-design": [
    {
      title: "UX Design Course - Google (Coursera Free Audit)",
      url: "https://www.coursera.org/professional-certificates/google-ux-design",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Laws of UX",
      url: "https://lawsofux.com/",
      type: "reference",
      verified: true,
      rating: 5
    },
    {
      title: "UX Mastery - Free Resources",
      url: "https://uxmastery.com/resources/",
      type: "resource",
      verified: true,
      rating: 4
    }
  ],
  "figma": [
    {
      title: "Figma Academy",
      url: "https://www.figma.com/academy/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Figma Help Center",
      url: "https://help.figma.com/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Figma Community",
      url: "https://www.figma.com/community/",
      type: "resource",
      verified: true,
      rating: 4
    }
  ],

  // BLOCKCHAIN & WEB3
  "blockchain": [
    {
      title: "Ethereum Developer Documentation",
      url: "https://ethereum.org/en/developers/docs/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Solidity Documentation",
      url: "https://docs.soliditylang.org/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "CryptoZombies - Learn Solidity",
      url: "https://cryptozombies.io/",
      type: "interactive",
      verified: true,
      rating: 4
    }
  ],
  "web3": [
    {
      title: "Web3 University",
      url: "https://www.web3.university/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "LearnWeb3 DAO",
      url: "https://learnweb3.io/",
      type: "course",
      verified: true,
      rating: 4
    },
    {
      title: "Buildspace Projects",
      url: "https://buildspace.so/",
      type: "project",
      verified: true,
      rating: 4
    }
  ],
  "solidity": [
    {
      title: "Solidity Documentation",
      url: "https://docs.soliditylang.org/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "CryptoZombies",
      url: "https://cryptozombies.io/",
      type: "interactive",
      verified: true,
      rating: 5
    },
    {
      title: "Solidity by Example",
      url: "https://solidity-by-example.org/",
      type: "tutorial",
      verified: true,
      rating: 4
    }
  ],

  // GAME DEVELOPMENT
  "unity": [
    {
      title: "Unity Learn",
      url: "https://learn.unity.com/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Unity Documentation",
      url: "https://docs.unity3d.com/Manual/index.html",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "Unity Microgames",
      url: "https://learn.unity.com/course/creative-core-platformer-microgame-for-educators",
      type: "project",
      verified: true,
      rating: 4
    }
  ],
  "c#": [
    {
      title: "Microsoft C# Documentation",
      url: "https://docs.microsoft.com/en-us/dotnet/csharp/",
      type: "documentation",
      verified: true,
      rating: 5
    },
    {
      title: "C# Tutorial - W3Schools",
      url: "https://www.w3schools.com/cs/",
      type: "tutorial",
      verified: true,
      rating: 4
    },
    {
      title: "Microsoft Learn - C# Path",
      url: "https://docs.microsoft.com/en-us/learn/paths/csharp-first-steps/",
      type: "course",
      verified: true,
      rating: 5
    }
  ],
  "game-development": [
    {
      title: "Unity Learn",
      url: "https://learn.unity.com/",
      type: "course",
      verified: true,
      rating: 5
    },
    {
      title: "Godot Engine Documentation",
      url: "https://docs.godotengine.org/en/stable/",
      type: "documentation",
      verified: true,
      rating: 4
    },
    {
      title: "Unreal Engine Online Learning",
      url: "https://www.unrealengine.com/en-US/onlinelearning-courses",
      type: "course",
      verified: true,
      rating: 4
    }
  ]
};

// Updated YouTube channels database with new categories
const YOUTUBE_CHANNELS = {
  "web-development": [
    {
      title: "Traversy Media",
      url: "https://www.youtube.com/@TraversyMedia",
      description: "Web development tutorials and crash courses"
    },
    {
      title: "freeCodeCamp.org",
      url: "https://www.youtube.com/@freecodecamp",
      description: "Full-length programming courses"
    },
    {
      title: "The Net Ninja",
      url: "https://www.youtube.com/@NetNinja",
      description: "Frontend and backend tutorials"
    }
  ],
  "python": [
    {
      title: "Corey Schafer",
      url: "https://www.youtube.com/@coreyms",
      description: "Python tutorials and best practices"
    },
    {
      title: "Programming with Mosh",
      url: "https://www.youtube.com/@programmingwithmosh",
      description: "Python and programming fundamentals"
    }
  ],
  "data-science": [
    {
      title: "Data School",
      url: "https://www.youtube.com/@dataschool",
      description: "Data science and machine learning tutorials"
    },
    {
      title: "StatQuest with Josh Starmer",
      url: "https://www.youtube.com/@statquest",
      description: "Statistics and machine learning concepts"
    }
  ],
  "mobile-development": [
    {
      title: "Flutter",
      url: "https://www.youtube.com/@flutterdev",
      description: "Official Flutter development tutorials"
    },
    {
      title: "React Native",
      url: "https://www.youtube.com/c/ReactNativeSchool",
      description: "React Native development tutorials"
    },
    {
      title: "iOS Academy",
      url: "https://www.youtube.com/@iOSAcademy",
      description: "iOS development with Swift"
    }
  ],
  "devops": [
    {
      title: "TechWorld with Nana",
      url: "https://www.youtube.com/@TechWorldwithNana",
      description: "DevOps, Docker, Kubernetes tutorials"
    },
    {
      title: "Cloud Advocate",
      url: "https://www.youtube.com/@MicrosoftDeveloper",
      description: "Cloud computing and Azure tutorials"
    }
  ],
  "cybersecurity": [
    {
      title: "HackerSploit",
      url: "https://www.youtube.com/@HackerSploit",
      description: "Cybersecurity and ethical hacking tutorials"
    },
    {
      title: "NetworkChuck",
      url: "https://www.youtube.com/@NetworkChuck",
      description: "IT, cybersecurity, and networking"
    }
  ],
  "ui-ux-design": [
    {
      title: "Design Course",
      url: "https://www.youtube.com/@DesignCourse",
      description: "UI/UX design and web design tutorials"
    },
    {
      title: "Figma",
      url: "https://www.youtube.com/@Figma",
      description: "Official Figma tutorials and tips"
    }
  ],
  "blockchain": [
    {
      title: "Dapp University",
      url: "https://www.youtube.com/@DappUniversity",
      description: "Blockchain development and smart contracts"
    },
    {
      title: "Whiteboard Crypto",
      url: "https://www.youtube.com/@WhiteboardCrypto",
      description: "Blockchain concepts explained simply"
    }
  ],
  "game-development": [
    {
      title: "Unity",
      url: "https://www.youtube.com/@unity",
      description: "Official Unity game development tutorials"
    },
    {
      title: "Brackeys",
      url: "https://www.youtube.com/@Brackeys",
      description: "Game development tutorials (archived but valuable)"
    }
  ]
};

// Helper functions - defined before they're used
function generateBetterSearchURL(title) {
  // Generate more specific URLs based on content
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('youtube') || lowerTitle.includes('video')) {
    const searchQuery = encodeURIComponent(title.replace(/youtube:?\s*/i, ''));
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  }
  
  if (lowerTitle.includes('freecodecamp')) {
    return 'https://www.freecodecamp.org/learn';
  }
  
  if (lowerTitle.includes('codecademy')) {
    return 'https://www.codecademy.com/catalog/subject/web-development';
  }
  
  if (lowerTitle.includes('coursera')) {
    return 'https://www.coursera.org/courses?query=free';
  }
  
  if (lowerTitle.includes('mdn') || lowerTitle.includes('mozilla')) {
    return 'https://developer.mozilla.org/';
  }
  
  if (lowerTitle.includes('w3schools')) {
    return 'https://www.w3schools.com/';
  }
  
  // Default to Google search
  const searchQuery = encodeURIComponent(title + ' free tutorial');
  return `https://www.google.com/search?q=${searchQuery}`;
}

function parseResourceWithDatabase(content) {
  // Extract URL if present
  const urlMatch = content.match(/(https?:\/\/[^\s\)]+)/);
  let url = urlMatch ? urlMatch[1] : null;
  
  // Clean the content to get the title
  let title = content.replace(/(https?:\/\/[^\s\)]+)/, '').trim();
  title = title.replace(/^\(|\)$/g, '').trim(); // Remove parentheses
  
  // If no URL found, try to match with curated resources
  if (!url) {
    const lowerTitle = title.toLowerCase();
    
    // Search through all categories in CURATED_RESOURCES
    for (const [category, resources] of Object.entries(CURATED_RESOURCES)) {
      if (lowerTitle.includes(category) || lowerTitle.includes(category.replace('-', ' '))) {
        // Find the best matching resource
        const matchingResource = resources.find(resource => 
          lowerTitle.includes(resource.title.toLowerCase().split(' ')[0]) ||
          resource.title.toLowerCase().includes(lowerTitle.split(' ')[0])
        );
        
        if (matchingResource) {
          return {
            title: matchingResource.title,
            url: matchingResource.url,
            type: matchingResource.type
          };
        }
      }
    }
    
    // If still no match, generate a search URL
    url = generateBetterSearchURL(title);
  }
  
  return {
    title: title || "Learning Resource",
    url: url,
    type: "course"
  };
}

function parseResource(content) {
  try {
    return parseResourceWithDatabase(content);
  } catch (error) {
    console.error("Error parsing resource:", error);
    // Return a fallback resource
    return {
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      url: generateBetterSearchURL(content),
      type: "course"
    };
  }
}

function createEnhancedFallback(text) {
  console.log("Creating enhanced fallback roadmap");
  
  // Try to extract any skills or technologies mentioned in the text
  const commonSkills = ['html', 'css', 'javascript', 'react', 'node', 'python', 'sql', 'git'];
  const mentionedSkills = [];
  
  const lowerText = text.toLowerCase();
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      mentionedSkills.push(skill);
    }
  });
  
  // Create a basic 3-phase roadmap
  const fallbackPhases = [
    {
      phase: 1,
      title: "Foundation Skills",
      duration: "2-3 weeks",
      skills: mentionedSkills.length > 0 ? 
        mentionedSkills.slice(0, 3).map(skill => `${skill.charAt(0).toUpperCase() + skill.slice(1)} fundamentals`) :
        ["HTML and CSS basics", "JavaScript fundamentals", "Version control with Git"],
      resources: [
        {
          title: "freeCodeCamp - Web Development",
          url: "https://www.freecodecamp.org/learn/",
          type: "course"
        },
        {
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org/",
          type: "documentation"
        }
      ],
      projects: [
        "Build a personal portfolio website",
        "Create a simple landing page",
        "Make a basic calculator"
      ]
    },
    {
      phase: 2,
      title: "Intermediate Development",
      duration: "3-4 weeks",
      skills: mentionedSkills.length > 3 ?
        mentionedSkills.slice(3, 6).map(skill => `${skill.charAt(0).toUpperCase() + skill.slice(1)} development`) :
        ["Framework fundamentals", "API integration", "Database basics"],
      resources: [
        {
          title: "Official Documentation",
          url: "https://developer.mozilla.org/",
          type: "documentation"
        },
        {
          title: "YouTube Tutorials",
          url: "https://www.youtube.com/results?search_query=web+development+tutorial",
          type: "video"
        }
      ],
      projects: [
        "Build a todo application",
        "Create a weather dashboard",
        "Develop a simple CRUD app"
      ]
    },
    {
      phase: 3,
      title: "Advanced Topics",
      duration: "4-5 weeks",
      skills: [
        "Advanced framework concepts",
        "Testing and deployment",
        "Performance optimization"
      ],
      resources: [
        {
          title: "Advanced Tutorials",
          url: "https://www.freecodecamp.org/learn/",
          type: "course"
        },
        {
          title: "GitHub for Projects",
          url: "https://github.com/",
          type: "platform"
        }
      ],
      projects: [
        "Build a full-stack application",
        "Deploy to cloud platform",
        "Create a portfolio project"
      ]
    }
  ];
  
  return fallbackPhases;
}

function getRelevantResources(skills) {
  const relevantResources = [];
  const skillKeywords = skills.join(' ').toLowerCase();
  
  // Match skills to resources
  Object.keys(CURATED_RESOURCES).forEach(category => {
    if (skillKeywords.includes(category) || 
        skillKeywords.includes(category.replace('-', ' '))) {
      relevantResources.push(...CURATED_RESOURCES[category]);
    }
  });

  // Remove duplicates and sort by rating
  const uniqueResources = relevantResources.filter((resource, index, self) =>
    index === self.findIndex(r => r.url === resource.url)
  );

  return uniqueResources.sort((a, b) => b.rating - a.rating);
}

function extractDuration(text) {
  const durationMatch = text.match(/(\d+[-\s]*\d*)\s*(week|month|day)/i);
  return durationMatch ? durationMatch[0] : "2-3 weeks";
}

function extractURL(text) {
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : null;
}

// Extract text function
async function extractText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (mimetype === "text/plain") {
    return fs.readFileSync(filePath, "utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}

app.post("/analyze", upload.single("resume"), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const file = req.file;

  if (!file) return res.status(400).send("No resume file uploaded");
  if (!jobDescription) return res.status(400).send("No job description provided");

  try {
    const resumeText = await extractText(file.path, file.mimetype);
    fs.unlinkSync(file.path);

    const prompt = `
You are a professional resume analyst. Analyze the following resume against the job description and provide a comprehensive analysis.

Resume:
${resumeText}

Job Description:
${jobDescription}

Please provide a detailed analysis covering:
1. Skills that match between the resume and job requirements
2. Important skills that are missing from the resume
3. Specific recommendations for improvement
4. An overall compatibility assessment with percentage

Write in a clear, professional tone with specific examples and actionable insights.
`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean markdown formatting from the response
    const cleanText = rawText
      .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic *text*
      .replace(/^[\s]*[-\*\+]\s+/gm, '• ') // Replace markdown bullets with clean bullets
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim();

    res.json({ analysis: cleanText });
  } catch (error) {
    console.error("Error in /analyze:", error);
    res.status(500).json({ error: "Error analyzing skills", details: error.message });
  }
});

app.post("/roadmap", async (req, res) => {
  const { analysis, jobDescription } = req.body;

  if (!analysis) return res.status(400).json({ error: "No analysis provided" });
  if (!jobDescription) return res.status(400).json({ error: "No job description provided" });

  try {
    const roadmapPrompt = `
Based on the following skill gap analysis and job description, create a comprehensive personalized learning roadmap.

Skill Gap Analysis:
${analysis}

Target Job Description:
${jobDescription}

CRITICAL: You must format your response EXACTLY like this example (use this exact format):

PHASE 1: Foundation Skills (2-3 weeks)

SKILLS:
- HTML and CSS fundamentals
- JavaScript basics and ES6 features
- Git version control

RESOURCES:
- YouTube: freeCodeCamp HTML/CSS Tutorial (https://www.youtube.com/watch?v=mU6anWqZJcc)
- Website: MDN Web Docs JavaScript Guide (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- Course: freeCodeCamp Responsive Web Design (https://www.freecodecamp.org/learn/responsive-web-design/)

PROJECTS:
- Build a personal portfolio website
- Create a responsive landing page
- Make an interactive calculator

PHASE 2: Intermediate Development (3-4 weeks)

SKILLS:
- React framework fundamentals
- API integration and fetch requests
- State management

RESOURCES:
- YouTube: The Net Ninja React Tutorial (https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d)
- Website: React Official Documentation (https://reactjs.org/docs/getting-started.html)
- Practice: JSONPlaceholder Free API (https://jsonplaceholder.typicode.com/)

PROJECTS:
- Todo app with local storage
- Weather dashboard using API
- Simple e-commerce product list

You MUST:
1. Use exactly "PHASE X:" for phase headers
2. Use exactly "SKILLS:" for skills sections
3. Use exactly "RESOURCES:" for resources sections  
4. Use exactly "PROJECTS:" for project sections
5. Start each item with "- " (dash and space)
6. Include real, working URLs in parentheses for resources
7. Create 3-4 phases total

Focus on free resources like freeCodeCamp, YouTube channels (Traversy Media, The Net Ninja, Programming with Mosh), MDN, W3Schools, Codecademy free courses, etc.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(roadmapPrompt);
    const response = await result.response;
    const rawRoadmap = response.text();

    // Improved parsing with better structure detection
    const structuredRoadmap = parseImprovedRoadmap(rawRoadmap);

    res.json({ roadmap: structuredRoadmap });
  } catch (error) {
    console.error("Error in /roadmap:", error);
    res.status(500).json({ error: "Error generating roadmap", details: error.message });
  }
});

// Improved parsing function for better structure detection
function parseImprovedRoadmap(text) {
  console.log("=== RAW ROADMAP TEXT ===");
  console.log(text);
  console.log("========================");
  
  const lines = text.split('\n');
  const roadmap = {
    phases: [],
    additionalTips: []
  };

  let currentPhase = null;
  let currentSection = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    console.log(`Line ${index}: "${trimmedLine}" | Section: ${currentSection}`);
    
    if (!trimmedLine) return;

    // More flexible phase detection
    const phaseMatch = trimmedLine.match(/^(?:PHASE\s+)?(\d+)[:.]?\s*(.+?)(?:\s*\(([^)]+)\))?$/i);
    if (phaseMatch && (trimmedLine.toLowerCase().includes('phase') || 
        trimmedLine.toLowerCase().includes('week') ||
        /^\d+[:.]/.test(trimmedLine))) {
      
      console.log(`Found phase: ${phaseMatch[1]} - ${phaseMatch[2]}`);
      
      // Save previous phase
      if (currentPhase) {
        console.log(`Saving previous phase with ${currentPhase.skills.length} skills, ${currentPhase.resources.length} resources`);
        roadmap.phases.push(currentPhase);
      }
      
      currentPhase = {
        phase: parseInt(phaseMatch[1]),
        title: phaseMatch[2].trim(),
        duration: phaseMatch[3] || extractDuration(trimmedLine) || "2-3 weeks",
        skills: [],
        resources: [],
        projects: []
      };
      currentSection = 'phase';
      return;
    }

    // More flexible section detection
    if (trimmedLine.match(/^(?:SKILLS?|Skills?)\s*:?\s*$/i)) {
      console.log("Found SKILLS section");
      currentSection = 'skills';
      return;
    }
    
    if (trimmedLine.match(/^(?:RESOURCES?|Resources?|FREE\s+RESOURCES?)\s*:?\s*$/i)) {
      console.log("Found RESOURCES section");
      currentSection = 'resources';
      return;
    }
    
    if (trimmedLine.match(/^(?:PROJECTS?|Projects?)\s*:?\s*$/i)) {
      console.log("Found PROJECTS section");
      currentSection = 'projects';
      return;
    }

    // More flexible content detection
    if (currentPhase && (trimmedLine.startsWith('- ') || 
                         trimmedLine.startsWith('• ') || 
                         trimmedLine.startsWith('* ') ||
                         (trimmedLine.match(/^\d+\./) && currentSection !== 'phase'))) {
      
      let content = trimmedLine;
      if (content.startsWith('- ') || content.startsWith('• ') || content.startsWith('* ')) {
        content = content.substring(2);
      } else if (content.match(/^\d+\./)) {
        content = content.replace(/^\d+\.\s*/, '');
      }
      
      console.log(`Adding to ${currentSection}: ${content}`);
      
      if (currentSection === 'skills') {
        currentPhase.skills.push(content);
      } else if (currentSection === 'resources') {
        const resource = parseResource(content);
        currentPhase.resources.push(resource);
      } else if (currentSection === 'projects') {
        currentPhase.projects.push(content);
      }
    }
  });

  // Add the last phase
  if (currentPhase) {
    console.log(`Saving final phase with ${currentPhase.skills.length} skills, ${currentPhase.resources.length} resources`);
    roadmap.phases.push(currentPhase);
  }

  console.log(`Total phases parsed: ${roadmap.phases.length}`);

  // If parsing failed or phases are empty, create enhanced fallback
  if (roadmap.phases.length === 0 || roadmap.phases.every(phase => phase.skills.length === 0 && phase.resources.length === 0)) {
    console.log("Parsing failed or empty phases, using enhanced fallback");
    roadmap.phases = createEnhancedFallback(text);
  }

  console.log("=== FINAL PARSED ROADMAP ===");
  console.log(JSON.stringify(roadmap, null, 2));
  console.log("============================");
  return roadmap;
}

// Import chatbot routes
const studybotRoutes = require("./api/studybotRoutes");
app.use("/api", studybotRoutes); // All chatbot routes start with /api

// Serve React build files in production
if (process.env.NODE_ENV === "production") {
  // Set static folder to client build
  app.use(express.static(path.join(__dirname, "../skillgap-analyzer/build")));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../skillgap-analyzer/build", "index.html"));
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});