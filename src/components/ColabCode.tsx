
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const ColabCode = () => {
  const pythonCode = `# Career Match Oracle - Resume Analysis for LinkedIn Jobs
# Google Colab Implementation

import re
import time
import PyPDF2
import requests
import io
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import CountVectorizer
from google.colab import files
import warnings
warnings.filterwarnings('ignore')

# -------------------------------
# 🔧 Extract text from PDF resume
# -------------------------------
def extract_text_from_pdf(file):
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\\n"
        return text.strip()
    except Exception as e:
        print(f"❌ Error extracting text from PDF: {e}")
        return ""

# -------------------------------
# 🌐 Scrape LinkedIn job post
# -------------------------------
def scrape_job_description(linkedin_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(linkedin_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find job description
        job_text = ""
        description_elements = soup.find_all(class_="show-more-less-html__markup")
        
        for element in description_elements:
            job_text += element.get_text() + "\\n"
            
        if not job_text:
            print("❌ Could not find job description via direct scraping")
            # Fallback for user to provide job description manually
            print("\\nPlease paste the job description below:")
            print("(Type 'END' on a new line when finished)")
            
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            
            job_text = "\\n".join(lines)
        
        return job_text
        
    except Exception as e:
        print(f"❌ Error scraping job description: {e}")
        print("\\nPlease paste the job description below:")
        print("(Type 'END' on a new line when finished)")
        
        lines = []
        while True:
            line = input()
            if line.strip() == 'END':
                break
            lines.append(line)
        
        return "\\n".join(lines)

# -------------------------------
# 🧠 Extract keywords from text
# -------------------------------
def extract_keywords(text):
    text = re.sub(r'[^\\w\\s]', '', text.lower())
    words = text.split()

    # Common stopwords + noise words
    stopwords = set([
        'the', 'and', 'to', 'of', 'in', 'a', 'for', 'on', 'with', 'as', 'by', 'at',
        'an', 'be', 'is', 'are', 'this', 'that', 'or', 'it', 'from', 'you', 'your',
        'will', 'we', 'our', 'their', 'they', 'i', 'have', 'has', 'was', 'were'
    ])

    # 🔇 Additional noisy keywords
    blacklist = set([
        'individuals', 'join', 'learn', 'opportunity', 'growing', 'specializing',
        'handson', 'proficient', 'fulltime', 'team', 'build', 'trained', 'provide',
        'title', 'seeking', 'industryfield', 'innovative', 'become', 'closely', 'who',
        'maintain', 'solving', 'remote', 'trainee', 'type', 'excellent', 'role',
        'environment', 'company', 'location', 'coding', 'developer', 'apis',
        'enthusiastic', 'more', 'problems', 'apply', 'forwardthinking', 'realworld',
        'eager', 'currently', 'applications', 'job', 'position', 'dedicated'
    ])

    return set([word for word in words if word not in stopwords and word not in blacklist and len(word) > 2])

# -------------------------------
# 📈 Compute match score
# -------------------------------
def compute_score(resume_keywords, job_keywords):
    matched_keywords = resume_keywords.intersection(job_keywords)
    if len(job_keywords) == 0:
        return 0, [], []
    score = (len(matched_keywords) / len(job_keywords)) * 100
    return round(score, 2), list(matched_keywords), list(job_keywords - matched_keywords)

# -------------------------------
# 📄 Generate suggestions
# -------------------------------
def generate_suggestions(unmatched_keywords):
    suggestions = []
    for word in unmatched_keywords:
        suggestions.append(f"Consider adding experience or achievements related to: '{word}'.")
    return suggestions

# -------------------------------
# 🧩 Full ATS pipeline
# -------------------------------
def ats_pipeline(resume_file, linkedin_url):
    print("🔍 Extracting resume and job description...")

    # Process resume
    resume_text = extract_text_from_pdf(resume_file)
    print(f"📄 Extracted {len(resume_text)} characters from resume")
    
    # Get job description
    job_description = scrape_job_description(linkedin_url)
    print(f"🌐 Extracted {len(job_description)} characters from job post\\n")

    # Extract keywords
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)
    
    print(f"Found {len(resume_keywords)} keywords in resume")
    print(f"Found {len(job_keywords)} keywords in job description\\n")

    # Score and generate suggestions
    print("📊 Scoring resume based on job description keywords...")
    score, matched, unmatched = compute_score(resume_keywords, job_keywords)
    suggestions = generate_suggestions(unmatched)

    # Display results
    print(f"\\n" + "="*50)
    print(f"🎯 MATCH SCORE: {score}%")
    print("="*50)
    
    print(f"\\n✅ MATCHED KEYWORDS ({len(matched)}):")
    for keyword in matched[:10]:  # Show top 10
        print(f"✓ {keyword}")
    if len(matched) > 10:
        print(f"...and {len(matched) - 10} more")
    
    print(f"\\n❌ MISSING KEYWORDS ({len(unmatched)}):")
    for keyword in unmatched[:10]:  # Show top 10
        print(f"- {keyword}")
    if len(unmatched) > 10:
        print(f"...and {len(unmatched) - 10} more")
    
    print("\\n💡 SUGGESTIONS:")
    for i, suggestion in enumerate(suggestions[:5], 1):
        print(f"{i}. {suggestion}")
    if len(suggestions) > 5:
        print(f"...and {len(suggestions) - 5} more suggestions")

    # Create HTML report
    html_report = f"""
    <html>
    <head>
        <title>ATS Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
            h2 {{ color: #2c3e50; }}
            .score {{ font-size: 24px; font-weight: bold; color: {'#27ae60' if score >= 70 else '#e67e22' if score >= 50 else '#c0392b'}; }}
            .keyword {{ background-color: #f1f1f1; padding: 5px 10px; margin: 5px; display: inline-block; border-radius: 15px; }}
            .matched {{ color: #27ae60; }}
            .missing {{ color: #c0392b; }}
            ul {{ padding-left: 20px; }}
        </style>
    </head>
    <body>
        <h2>ATS Resume Analysis Report</h2>
        <p>Match Score: <span class="score">{score}%</span></p>
        
        <h3 class="matched">✅ Matched Keywords:</h3>
        <div>{''.join([f'<span class="keyword">{k}</span>' for k in matched])}</div>
        
        <h3 class="missing">❌ Missing Keywords:</h3>
        <div>{''.join([f'<span class="keyword">{k}</span>' for k in unmatched])}</div>
        
        <h3>💡 Suggestions:</h3>
        <ul>{''.join([f'<li>{s}</li>' for s in suggestions])}</ul>
        
        <p><em>Generated by Career Match Oracle</em></p>
    </body>
    </html>
    """
    
    # Save report to file
    with open('ATS_Report.html', 'w') as f:
        f.write(html_report)
    
    print("\\n✅ Analysis complete! HTML report saved as 'ATS_Report.html'")
    return {
        'score': score,
        'matched': matched,
        'unmatched': unmatched,
        'suggestions': suggestions
    }

# Run the application
if __name__ == "__main__":
    print("\\n🔮 Career Match Oracle - Resume Analyzer 🔮")
    print("Upload your resume and enter a LinkedIn job URL to analyze your match\\n")
    
    print("Step 1: Upload your resume (PDF format)")
    uploaded = files.upload()
    
    if not uploaded:
        print("No file was uploaded. Exiting.")
    else:
        file_name = list(uploaded.keys())[0]
        resume_file = io.BytesIO(uploaded[file_name])
        
        print("\\nStep 2: Enter the LinkedIn job posting URL")
        linkedin_url = input("LinkedIn job URL: ")
        
        results = ats_pipeline(resume_file, linkedin_url)`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Python Implementation for Google Colab</CardTitle>
        <CardDescription>Copy this code to run in Google Colab</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full border rounded-md bg-black text-white p-4">
          <pre className="text-sm font-mono">
            {pythonCode}
          </pre>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleCopyCode}>Copy Code</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColabCode;
