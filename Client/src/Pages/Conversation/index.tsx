import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { ArrowLeft, Globe, Upload, Search, Zap, UploadCloud } from "lucide-react";

export default function ConversionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inputType, setInputType] = useState<"url" | "file">("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const analyzeUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/analyze-website', { url });
      return response.json();
    },
    onSuccess: (data) => {
      // Store analysis data and proceed to next step
      sessionStorage.setItem('websiteAnalysis', JSON.stringify(data));
      sessionStorage.setItem('websiteUrl', websiteUrl);
      setLocation('/conversion/analysis/new');
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze website",
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('project', file);
      
      const response = await fetch('/api/upload-project', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Store analysis data and proceed to next step
      sessionStorage.setItem('websiteAnalysis', JSON.stringify(data));
      sessionStorage.setItem('projectType', 'upload');
      setLocation('/conversion/analysis/new');
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload project",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeUrl = () => {
    if (!websiteUrl) {
      toast({
        title: "URL required",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    analyzeUrlMutation.mutate(websiteUrl);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select a ZIP file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadFileMutation.mutate(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid file type",
          description: "Please select a ZIP file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Conversion Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Convert Website to App</h1>
              <p className="text-slate-600">Transform your website into a native mobile application</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conversion Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
              <span className="ml-3 text-slate-900 font-medium">Input</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-semibold">2</div>
              <span className="ml-3 text-slate-600">Analysis</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="ml-3 text-slate-600">Customize</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="ml-3 text-slate-600">Generate</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <Card className="p-8">
          <CardContent className="p-0">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Choose Input Method</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* URL Input Option */}
              <div 
                className={`border-2 rounded-xl p-6 hover:border-primary-300 transition-colors cursor-pointer ${
                  inputType === 'url' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
                }`}
                onClick={() => setInputType('url')}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                    inputType === 'url' ? 'bg-blue-200' : 'bg-blue-100'
                  }`}>
                    <Globe className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Website URL</h3>
                  <p className="text-slate-600 text-sm">Enter your website URL for automatic analysis and conversion</p>
                </div>
              </div>

              {/* File Upload Option */}
              <div 
                className={`border-2 rounded-xl p-6 hover:border-primary-300 transition-colors cursor-pointer ${
                  inputType === 'file' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
                }`}
                onClick={() => setInputType('file')}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                    inputType === 'file' ? 'bg-purple-200' : 'bg-purple-100'
                  }`}>
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload ZIP File</h3>
                  <p className="text-slate-600 text-sm">Upload a ZIP file containing your website project files</p>
                </div>
              </div>
            </div>

            {/* URL Input Form */}
            {inputType === 'url' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="websiteUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={handleAnalyzeUrl}
                      disabled={analyzeUrlMutation.isPending}
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAnalyzeUrl}
                  disabled={analyzeUrlMutation.isPending}
                  className="bg-gradient-to-br from-primary-600 to-primary-800"
                >
                  {analyzeUrlMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Website
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* File Upload Form */}
            {inputType === 'file' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                  <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">Drag and drop your ZIP file here</p>
                  <p className="text-slate-600 mb-4">or click to browse files</p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">Maximum file size: 100MB</p>
                  
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedFile && (
                  <Button 
                    onClick={handleFileUpload}
                    disabled={uploadFileMutation.isPending}
                    className="bg-gradient-to-br from-primary-600 to-primary-800"
                  >
                    {uploadFileMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload and Analyze
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
