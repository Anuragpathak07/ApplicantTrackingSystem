
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  InfoIcon, 
  FileTextIcon, 
  LinkedinIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  BrainCircuitIcon, 
  LoaderIcon, 
  ServerCrashIcon, 
  WifiIcon,
  WifiOffIcon 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { analyzeResume, getModelInfo, getBackendInfo, ResumeAnalysisResult, checkBackendStatus } from '@/utils/resumeAnalysis';

const Index = () => {
  const { toast } = useToast();
  const [resume, setResume] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResumeAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisStage, setAnalysisStage] = useState("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const backendInfo = getBackendInfo();

  // Check backend status regularly
  useEffect(() => {
    const checkStatus = async () => {
      console.log(`Checking backend status...`);
      setBackendStatus('checking');
  
      try {
        const isRunning = await checkBackendStatus();
  
        if (isRunning) {
          setBackendStatus(prevStatus => {
            if (prevStatus !== 'online') {
              toast({
                title: "✅ Backend Connected",
                description: "Successfully connected to Python backend.",
                duration: 3000,
              });
            }
            return 'online';
          });
        } else {
          setBackendStatus(prevStatus => {
            if (prevStatus !== 'offline') {
              toast({
                variant: "destructive",
                title: "⚠️ Backend Offline",
                description: `Could not connect to backend at ${backendInfo.url}. Please make sure it’s running.`,
              });
            }
            return 'offline';
          });
        }
      } catch (error) {
        setBackendStatus('offline');
        toast({
          variant: "destructive",
          title: "Backend Check Failed",
          description: `Error checking backend status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
  
      setConnectionAttempts((prev) => prev + 1);
    };
  
    checkStatus();
  
    // Optionally recheck every 60 seconds
    const interval = setInterval(checkStatus, 60000);
  
    return () => clearInterval(interval);
  }, []);

    
    // Check status every 30 seconds
    

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is too large (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 5MB",
        });
        return;
      }
      
      setResume(file);
      toast({
        title: "Resume uploaded",
        description: `File: ${file.name}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      toast({ title: "Please upload a resume" });
      return;
    }
    
    if (!linkedinUrl) {
      toast({ title: "Please enter a LinkedIn job URL" });
      return;
    }
  
     setLoading(true);
    
    try {
      const results = await analyzeResume(resume, linkedinUrl);
      setResults(results);
      setActiveTab("results");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
     } finally {
      setLoading(false);
     }
   };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Career Match Oracle</h1>
        <p className="text-xl text-muted-foreground">AI-powered resume analysis for job applications</p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Link to="/advanced-ml">
            <Button variant="outline" size="sm" className="flex items-center">
              <BrainCircuitIcon className="mr-2 h-4 w-4" />
              View Python Implementation
            </Button>
          </Link>
          
          <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
            {backendStatus === 'online' ? (
              <>
                <WifiIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">Backend Online</span>
              </>
            ) : backendStatus === 'checking' ? (
              <>
                <LoaderIcon className="h-4 w-4 text-yellow-500 mr-1 animate-spin" />
                <span className="text-yellow-600">Checking Backend</span>
              </>
            ) : (
              <>
                <WifiOffIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">Backend Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {backendStatus === 'offline' && (
        <Alert variant="destructive" className="mb-6">
          <ServerCrashIcon className="h-4 w-4" />
          <AlertTitle>Python Backend Not Running</AlertTitle>
          <AlertDescription>
            Cannot connect to Python backend at {backendInfo.url}. The backend should have:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>An <code>/analyze</code> endpoint that accepts POST requests with FormData containing 'resume' (file) and 'job_url' (string)</li>
              <li>A <code>/health</code> endpoint for backend status checks</li>
            </ul>
            Please ensure your Python server is running before analyzing resumes.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Resume</CardTitle>
                <CardDescription>
                  Upload your resume and provide a LinkedIn job posting to get feedback
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Upload Resume/CV</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        <FileTextIcon className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {resume ? resume.name : 'Click to upload your resume (PDF, DOC, DOCX)'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max file size: 5MB
                        </p>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url">LinkedIn Job URL</Label>
                    <div className="flex items-center space-x-2">
                      <LinkedinIcon className="h-5 w-5 text-[#0077B5]" />
                      <Input
                        id="linkedin-url"
                        type="url"
                        placeholder="https://www.linkedin.com/jobs/view/..."
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The Python backend will extract the job description from this URL and analyze it
                    </p>
                  </div>

                  {loading && (
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex items-center space-x-2 mb-3">
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                        <p className="font-medium text-sm">{analysisStage}</p>
                      </div>
                      <Progress 
                        value={Math.random() * 100} 
                        className="h-2 animate-pulse" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This process may take up to 45 seconds as the backend scrapes the job description and analyzes your resume
                      </p>
                    </div>
                  )}

                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <h3 className="font-medium text-sm">Analysis Method</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{getModelInfo()}</p>
                    
                    <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                      <h4 className="font-medium text-sm mb-1">Backend Integration</h4>
                      <p className="text-xs text-muted-foreground">
                        Connecting to: {backendInfo.url}
                        <br />
                        Resume Analysis Endpoint: {backendInfo.endpoints.analyze}
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || backendStatus !== 'online'}
                  >
                    {loading ? "Running Analysis..." : "Analyze Resume Match"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            {results && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-bold">{results.matchScore}%</span>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={
                              results.matchScore > 80 ? "#10b981" : 
                              results.matchScore > 60 ? "#f59e0b" : 
                              "#ef4444"
                            }
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * results.matchScore) / 100}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      
                      <div className="w-full mt-6 space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Technical Skills</span>
                            <span className="text-sm font-medium">{results.skillsBreakdown.technical}%</span>
                          </div>
                          <Progress value={results.skillsBreakdown.technical} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Soft Skills</span>
                            <span className="text-sm font-medium">{results.skillsBreakdown.soft}%</span>
                          </div>
                          <Progress value={results.skillsBreakdown.soft} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Experience</span>
                            <span className="text-sm font-medium">{results.skillsBreakdown.experience}%</span>
                          </div>
                          <Progress value={results.skillsBreakdown.experience} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Python Analysis Results</CardTitle>
                    <CardDescription>Output from Python resume analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      <div className="text-xl font-bold mb-4">
                        🎯 Match Score: {results.matchScore}%
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-green-500 mr-2">✅</span>
                          <span className="font-semibold">Matched Keywords:</span>
                        </div>
                        <div className="pl-6">
                          {results.keywordMatch.found.length > 0 
                            ? results.keywordMatch.found.join(", ") 
                            : "No keywords matched"}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-amber-500 mr-2">💡</span>
                          <span className="font-semibold">Suggestions:</span>
                        </div>
                        <ul className="pl-6 space-y-1">
                          {results.improvements.map((improvement, i) => (
                            <li key={i} className="list-none">
                              - {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <Alert>
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Next steps</AlertTitle>
                      <AlertDescription>
                        Consider updating your resume based on these suggestions to improve your chances of getting an interview.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setActiveTab("upload")} className="w-full">
                      Analyze Another Resume
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          This application connects to a Python backend that runs analysis with Selenium and PyPDF2.
          Make sure your Python server is running at {backendInfo.url}.
        </p>
      </div>

      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Implementation Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Web App Frontend</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>React user interface</li>
                <li>PDF/Doc resume parsing</li>
                <li>Real-time analysis display</li>
                <li>Backend connection monitoring</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BrainCircuitIcon className="mr-2 h-4 w-4" />
                Python Backend
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Selenium for LinkedIn scraping</li>
                <li>PyPDF2 for PDF processing</li>
                <li>NLP for keyword extraction</li>
                <li>Resume-to-job matching algorithm</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-sm text-left space-y-4">
          <p>
            Python implementation uses the following components:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Selenium WebDriver for reliable LinkedIn job description extraction</li>
            <li>PyPDF2 for resume parsing from PDF</li>
            <li>Custom stopword filtering to focus on meaningful keywords</li>
            <li>Keyword extraction and intersection matching</li>
            <li>Automatic suggestion generation based on missing keywords</li>
            <li>HTML report generation with visualizations</li>
          </ul>
          
          <div className="bg-background p-4 rounded-md mt-4">
            <h3 className="font-medium mb-2">Required Backend Endpoints:</h3>
            <pre className="text-xs overflow-x-auto">
              <code>{`# Health endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

# Resume analysis endpoint
@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files or 'job_url' not in request.form:
        return jsonify({"error": "Missing resume file or job URL"}), 400
        
    resume_file = request.files['resume']
    job_url = request.form['job_url']
    
    # Process resume and job URL...
    # Return analysis results as JSON
    return jsonify({
        "matchScore": 75,
        "keywordMatch": {
            "found": ["python", "react", "api"],
            "missing": ["aws", "docker"]
        },
        "skillsBreakdown": {
            "technical": 70,
            "soft": 60,
            "experience": 80
        },
        "improvements": ["Add AWS experience", "Mention Docker skills"]
    })`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

