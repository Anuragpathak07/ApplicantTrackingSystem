
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangleIcon, FileTextIcon, BrainCircuitIcon, CodeIcon, GithubIcon } from "lucide-react";
import { Link } from "react-router-dom";
import ColabCode from "@/components/ColabCode";

const PythonImplementation = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary">Direct Job Matching</h1>
          <p className="text-xl text-muted-foreground">
            Keyword-based resume analysis with higher accuracy
          </p>
        </div>
        <Link to="/">
          <Button variant="outline">Back to Web App</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuitIcon className="mr-2 h-5 w-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Keyword Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Uses natural language processing to extract and match keywords between your resume and job descriptions
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">LinkedIn Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Directly scrapes job descriptions from LinkedIn URLs using Selenium
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Smart Filtering</h3>
                <p className="text-sm text-muted-foreground">
                  Filters out common stopwords and noise terms to focus on meaningful matches
                </p>
              </div>
              
              <div className="pt-2">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">PyPDF2</Badge>
                  <Badge variant="outline">Selenium</Badge>
                  <Badge variant="outline">BeautifulSoup</Badge>
                  <Badge variant="outline">scikit-learn</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5" />
                Usage Instructions
              </CardTitle>
              <CardDescription>
                Simple two-step process to analyze your resume match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Required Inputs</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Your resume in PDF format</li>
                  <li>LinkedIn job URL</li>
                </ul>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm whitespace-pre-wrap">
{`# Simple usage - just two parameters
ats_pipeline("your_resume.pdf", "https://www.linkedin.com/jobs/view/12345")`}
                </code>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The Python implementation:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Extracts text from your resume PDF</li>
                  <li>Scrapes the job description from LinkedIn using Selenium</li>
                  <li>Analyzes keyword matches and provides a percentage match score</li>
                  <li>Generates suggestions based on missing keywords</li>
                  <li>Creates an HTML report and improved resume text file</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-center p-4">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => window.open("https://colab.research.google.com/", "_blank")}
                >
                  Open Google Colab to Run Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" />
              Source Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">
                <code>
{`import re
import time
import PyPDF2
import requests
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import CountVectorizer
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# -------------------------------
# 🔧 Extract text from PDF resume
# -------------------------------
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\\n"
    return text.strip()

# -------------------------------
# 🌐 Scrape LinkedIn job post
# -------------------------------
def scrape_job_description(linkedin_url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(linkedin_url)
        time.sleep(5)

        # Extract only Job Description / Responsibilities section
        job_text = ""
        elements = driver.find_elements(By.CLASS_NAME, "show-more-less-html__markup")
        for el in elements:
            section = el.text.lower()
            if any(keyword in section for keyword in ["responsibilities", "description", "role", "key responsibilities", "job responsibilities"]):
                job_text += el.text + "\\n"

        job_text = re.sub(r'\\s+', ' ', job_text).strip()
    except Exception as e:
        print("❌ Error scraping job description:", e)
        job_text = ""
    finally:
        driver.quit()

    return job_text

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

    # 🔇 Additional noisy keywords (feel free to expand this list)
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
def ats_pipeline(resume_path, linkedin_url):
    print("🔍 Extracting resume and job description...")

    resume_text = extract_text_from_pdf(resume_path)
    job_description = scrape_job_description(linkedin_url)

    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)

    print("📊 Scoring resume based on job description keywords...")
    score, matched, unmatched = compute_score(resume_keywords, job_keywords)
    suggestions = generate_suggestions(unmatched)

    print(f"\\n🎯 Match Score: {score}%")
    print(f"✅ Matched Keywords: {', '.join(matched)}")
    print("💡 Suggestions:")
    for suggestion in suggestions:
        print(f" - {suggestion}")

    # Save improved resume text and report
    with open("Improved_Resume.txt", "w") as f:
        f.write(resume_text + "\\n\\n" + "\\n".join(suggestions))

    with open("ATS_Report.html", "w") as f:
        f.write(f"""
        <html>
        <head><title>ATS Report</title></head>
        <body>
            <h2>Match Score: {score}%</h2>
            <h3>✅ Matched Keywords:</h3><p>{', '.join(matched)}</p>
            <h3>💡 Suggestions:</h3><ul>
            {''.join([f'<li>{s}</li>' for s in suggestions])}
            </ul>
        </body>
        </html>
        """)

    print("\\n✅ Improved resume saved as 'Improved_Resume.txt'")
    print("📄 Report saved as 'ATS_Report.html'")`}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PythonImplementation;
