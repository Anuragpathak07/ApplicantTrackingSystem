import re
import time
import PyPDF2
import spacy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from sklearn.feature_extraction.text import TfidfVectorizer

# Load spaCy
nlp = spacy.load("en_core_web_sm")

# -------------------------------
# 🌍 Global Skill Sets
# -------------------------------
TECH_SKILLS = {
    # Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c', 'c#', 'go', 'ruby', 'rust', 'swift', 'kotlin',
    'sql', 'nosql', 'bash', 'r', 'matlab', 'scala',

    # Web & App Dev
    'html', 'css', 'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'flask', 'django',
    'tailwind', 'bootstrap', 'sass', 'jquery', 'php', 'rest', 'graphql', 'api', 'apis',

    # AI/ML
    'machine learning', 'deep learning', 'ai', 'data science', 'pytorch', 'tensorflow', 'keras',
    'scikit-learn', 'xgboost', 'lightgbm', 'catboost', 'mlops', 'nlp', 'computer vision',
    'reinforcement learning', 'bayesian', 'gan', 'transformers', 'huggingface',

    # Data & Analytics
    'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 'statsmodels', 'big data',
    'data analytics', 'statistical modeling', 'business intelligence', 'excel',
    'power bi', 'tableau', 'metabase',

    # Cloud
    'aws', 'azure', 'gcp', 'cloud computing', 'cloud storage', 'lambda', 'ec2', 's3',
    'cloud functions', 'app engine', 'firebase', 'amplify',

    # DevOps & Containers
    'docker', 'kubernetes', 'devops', 'jenkins', 'terraform', 'ansible', 'prometheus',
    'grafana', 'circleci', 'github actions', 'helm',

    # Data Engineering
    'hadoop', 'spark', 'kafka', 'airflow', 'dbt', 'etl', 'data lake', 'data warehouse',
    'snowflake', 'databricks', 'redshift', 'bigquery',

    # Cybersecurity
    'cybersecurity', 'ethical hacking', 'ceh', 'penetration testing', 'network security',
    'risk assessment', 'vulnerability assessment', 'owasp', 'firewalls', 'siem', 'burp suite',

    # Mobile & Desktop
    'android', 'ios', 'react native', 'flutter', 'swiftui', 'electron',

    # Tools & Platforms
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'notion', 'vs code', 'jupyter',
    'linux', 'wsl', 'virtualenv', 'conda', 'postman', 'swagger',

    # Hardware/Edge
    'arduino', 'raspberry pi', 'iot', 'nvidia', 'cuda', 'tensorrt',

    # General
    'software development', 'backend', 'frontend', 'fullstack', 'agile', 'scrum',
    'design patterns', 'api development', 'system design'
}


blacklist = {
    'individuals', 'join', 'opportunity', 'team', 'role', 'position',
    'company', 'culture', 'internship', 'career', 'dynamic', 'creative',
    'currently', 'enthusiastic', 'eager', 'forward', 'growing', 'real',
    'remote', 'location', 'type', 'title', 'work', 'working', 'apply',
    'developer', 'trainee', 'excellent', 'job', 'proficient', 'trained',
    'problems', 'thinking', 'maintain', 'tools', 'hands', 'closely', 'web',
    'dedicated', 'environment', 'field', 'industry', 'innovative', 
    'passionate', 'provide', 'seeking', 'solving', 'specializing', 
    'time', 'world', 'build', 'developing'
}

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        return "\n".join(page.extract_text() for page in pdf_reader.pages if page.extract_text())


def scrape_job_description(linkedin_url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(linkedin_url)
        time.sleep(5)
        elements = driver.find_elements(By.CLASS_NAME, "show-more-less-html__markup")
        job_text = "\n".join(el.text for el in elements)
        return re.sub(r'\s+', ' ', job_text).strip()
    finally:
        driver.quit()

def extract_keywords(text):
    doc = nlp(text.lower())
    pos_tags = {"NOUN", "PROPN", "VERB"}
    spaCy_keywords = {
        token.text for token in doc
        if token.pos_ in pos_tags and not token.is_stop
    }

    vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
    try:
        tfidf_matrix = vectorizer.fit_transform([text])
        tfidf_keywords = set(vectorizer.get_feature_names_out())
    except:
        tfidf_keywords = set()

    combined_keywords = spaCy_keywords.union(tfidf_keywords)

    final_keywords = {
        word for word in combined_keywords
        if (
            word in TECH_SKILLS or
            (len(word) > 2 and not any(char.isdigit() for char in word) and word not in blacklist)
        )
    }

    return final_keywords


def compute_score(resume_keywords, job_keywords):
    matched_keywords = resume_keywords & job_keywords
    if not job_keywords:
        return 0, [], []

    tech_weight = 1.5
    weighted_score = 0
    for word in job_keywords:
        weight = tech_weight if word in TECH_SKILLS else 1
        if word in matched_keywords:
            weighted_score += weight

    max_score = sum(tech_weight if word in TECH_SKILLS else 1 for word in job_keywords)
    score = (weighted_score / max_score) * 100
    return round(score, 2), sorted(matched_keywords), sorted(job_keywords - matched_keywords)

def generate_suggestions(unmatched_keywords):
    return [f"Consider adding experience with: {kw}" for kw in unmatched_keywords]


def ats_pipeline(resume_path, linkedin_url):
    print("🔍 Extracting content...")
    resume_text = extract_text_from_pdf(resume_path)
    job_text = scrape_job_description(linkedin_url)

    print("🧠 Analyzing keywords...")
    resume_kws = extract_keywords(resume_text)
    job_kws = extract_keywords(job_text)

    score, matched, unmatched = compute_score(resume_kws, job_kws)
    suggestions = generate_suggestions(unmatched)

    print(f"\n🎯 Match Score: {score}%")
    print(f"✅ Matched Keywords: {', '.join(matched)}")
    print("💡 Suggestions:")
    for s in suggestions:
        print(f" - {s}")

    with open("Improved_Resume.txt", "w", encoding="utf-8") as f:
        f.write(resume_text + "\n\n" + "\n".join(suggestions))

    with open("ATS_Report.html", "w", encoding="utf-8") as f:
        f.write(f"""<html>
        <head><title>ATS Report</title></head>
        <body>
            <h2>Match Score: {score}%</h2>
            <h3>✅ Matched Keywords:</h3><p>{', '.join(matched)}</p>
            <h3>💡 Suggestions:</h3><ul>
            {''.join(f'<li>{s}</li>' for s in suggestions)}
            </ul>
        </body></html>""")

    print("\n✅ Output files saved")
    return score, matched, suggestions
