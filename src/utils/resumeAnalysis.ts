export interface ResumeAnalysisResult {
  matchScore: number;
  keywordMatch: {
    found: string[];
    missing: string[];
  };
  skillsBreakdown: {
    technical: number;
    soft: number;
    experience: number;
  };
  improvements: string[];
}

export const analyzeResume = async (
  resumeFile: File,
  jobUrl: string
): Promise<ResumeAnalysisResult> => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_link', jobUrl);

  try {
    const response = await fetch('http://127.0.0.1:5000/api/score', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw backend response:', data); // Debug log

    // Ensure the response matches the expected format
    if (!data.matchScore && data.score) {
      data.matchScore = data.score; // Handle legacy response format
    }

    return {
      matchScore: data.matchScore || 0,
      keywordMatch: {
        found: data.keywordMatch?.found || data.matched_keywords || [],
        missing: data.keywordMatch?.missing || data.missing_keywords || []
      },
      skillsBreakdown: {
        technical: data.skillsBreakdown?.technical || data.technical_score || (data.matchScore || data.score) * 0.8,
        soft: data.skillsBreakdown?.soft || data.soft_score || (data.matchScore || data.score) * 0.6,
        experience: data.skillsBreakdown?.experience || data.experience_score || (data.matchScore || data.score) * 0.7
      },
      improvements: data.improvements || data.suggestions || []
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Health check with proper timeout handling
export const checkBackendStatus = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('http://127.0.0.1:5000/health', {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    return response.ok && data?.status === "ok";
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Backend check failed:', error);
    return false;
  }
};

export const getBackendInfo = () => ({
  url: 'http://127.0.0.1:5000',
  endpoints: {
    analyze: '/api/score',
    health: '/health'
  }
});

export const getModelInfo = () => 
  "Python ATS Analysis using PyPDF2 (resume parsing) and Selenium (job description scraping)";