from flask import Flask, request, jsonify
from flask_cors import CORS
from ats import ats_pipeline
import os
import tempfile
import traceback
import traceback

app = Flask(__name__)
CORS(app)




@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Resume Analyzer API",
        "routes": {
            "health": "/health [GET]",
            "analyze": "/api/score [POST]"
        }
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for frontend monitoring"""
    return jsonify({
        "status": "ok",
        "message": "Backend service is operational",
        "endpoints": {
            "analyze": "/api/score [POST]",
            "health": "/health [GET]"
        }
    })

@app.route('/api/score', methods=['GET','POST'])

def analyze_resume():
    if request.method == 'GET':
        return jsonify({"message": "Use POST to analyze resume"}), 405
    try:
        # Validate required inputs
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided"}), 400
        if 'job_link' not in request.form:
            return jsonify({"error": "No job link provided"}), 400

        resume_file = request.files['resume']
        job_link = request.form['job_link']

        # Validate file type
        allowed_extensions = {'.pdf', '.doc', '.docx'}
        if not any(resume_file.filename.lower().endswith(ext) for ext in allowed_extensions):
            return jsonify({
                "error": "Invalid file type",
                "supported_types": list(allowed_extensions)
            }), 400

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            resume_path = tmp.name
            resume_file.save(resume_path)

        # Process through ATS pipeline
        score, matched_keywords, suggestions = ats_pipeline(resume_path, job_link)
        
        # Calculate detailed scores
        technical_score = score * 0.8  # Adjust weights as needed
        soft_score = score * 0.6
        experience_score = score * 0.72
        
        # Get missing keywords (modify ats.py to return these)
        job_keywords = set()  # Should come from ats_pipeline
        resume_keywords = set()  # Should come from ats_pipeline
        missing_keywords = list(job_keywords - resume_keywords)

        # Prepare complete response
        response = {
            "matchScore": score,  # Frontend expects camelCase
            "keywordMatch": {
                "found": matched_keywords,
                "missing": missing_keywords
            },
            "skillsBreakdown": {
                "technical": technical_score,
                "soft": soft_score,
                "experience": experience_score
            },
            "improvements": suggestions
        }
        
        print("DEBUG RESPONSE:", response) 
        return jsonify(response)

    except Exception as e:
        app.logger.error(f"Analysis failed: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            "error": "Resume analysis failed",
            "details": str(e),
            "trace": traceback.format_exc()
        }), 500

    finally:
        # Clean up temporary files
        if 'resume_path' in locals() and os.path.exists(resume_path):
            os.remove(resume_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)