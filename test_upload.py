import requests
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://127.0.0.1:5000"
TEST_RESUME_PATH =  "resume.pdf"  # Update this path
TEST_JOB_URL = "https://www.linkedin.com/jobs/search/?currentJobId=4202139421&geoId=102713980&keywords=junior%20aiml%20software%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true"

def test_resume_upload():
    """Test the resume analysis endpoint"""
    print(f"\nTesting resume upload to {BACKEND_URL}")
    
    # Verify the test file exists
    if not os.path.exists(TEST_RESUME_PATH):
        print(f"Error: Test resume not found at {TEST_RESUME_PATH}")
        return

    try:
        # Prepare the request
        files = {'resume': open(TEST_RESUME_PATH, 'rb')}
        data = {'job_link': TEST_JOB_URL}

        # Send the request
        print("Sending POST request to /api/score...")
        response = requests.post(
            f"{BACKEND_URL}/api/score",
            files=files,
            data=data
        )

        # Print results
        print(f"\nStatus Code: {response.status_code}")
        print("Response Body:")
        print(response.json())

    except requests.exceptions.RequestException as e:
        print(f"\nRequest failed: {str(e)}")
        print("Make sure your Flask backend is running!")
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")
    finally:
        if 'files' in locals():
            files['resume'].close()

if __name__ == '__main__':
    print("=== Resume Analysis API Test ===")
    test_resume_upload()