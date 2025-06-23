import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { ArrowLeft, CheckCircle, Lightbulb, Zap, Clock, Upload } from "lucide-react";

interface WebsiteAnalysis {
  compatible: boolean;
  contentType: string;
  mobileOptimized: boolean;
  estimatedSize: string;
  recommendations: string[];
  structure: {
    hasNavigation: boolean;
    hasFooter: boolean;
    hasImages: boolean;
    hasVideos: boolean;
    hasForms: boolean;
  };
}

export default function AnalysisPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [platform, setPlatform] = useState("android");
  const [mode, setMode] = useState("online");

  useEffect(() => {
    // Get analysis data from session storage
    const analysisData = sessionStorage.getItem('websiteAnalysis');
    const url = sessionStorage.getItem('websiteUrl');
    
    if (analysisData) {
      setAnalysis(JSON.parse(analysisData));
    }
    
    if (url) {
      setWebsiteUrl(url);
      // Generate default app name from URL
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        const appName = domain.charAt(0).toUpperCase() + domain.slice(1).replace(/\.[^/.]+$/, '') + ' App';
        setAppName(appName);
      } catch {
        setAppName('My App');
      }
    } else {
      setAppName('My Project App');
    }
  }, []);

  const createAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      const response = await apiRequest('POST', '/api/apps', appData);
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/conversion/progress/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start conversion",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleStartConversion = () => {
    if (!appName.trim()) {
      toast({
        title: "App name required",
        description: "Please enter a name for your app",
        variant: "destructive",
      });
      return;
    }

    if (user?.plan === 'free' && platform !== 'android') {
      toast({
        title: "Upgrade required",
        description: "iOS and Desktop apps require a Pro plan",
        variant: "destructive",
      });
      return;
    }

    createAppMutation.mutate({
      name: appName,
      websiteUrl: websiteUrl || null,
      platform,
      mode,
    });
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/conversion">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Website Analysis Complete</h1>
              <p className="text-slate-600">Review the analysis and customize your app settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Updated Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-3 text-slate-900 font-medium">Input</span>
            </div>
            <div className="w-16 h-1 bg-green-600 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-3 text-slate-900 font-medium">Analysis</span>
            </div>
            <div className="w-16 h-1 bg-primary-600 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="ml-3 text-slate-900 font-medium">Customize</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="ml-3 text-slate-600">Generate</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compatibility Status */}
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    analysis.compatible ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <CheckCircle className={`w-6 h-6 ${
                      analysis.compatible ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {analysis.compatible ? 'Compatible Website' : 'Compatibility Issues'}
                    </h3>
                    <p className={`font-medium ${
                      analysis.compatible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analysis.contentType}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600">
                  {analysis.compatible 
                    ? "Your website is fully compatible with our conversion process. The structure is well-optimized for mobile app transformation."
                    : "Some compatibility issues were detected. Please review the recommendations below before proceeding."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Website Structure */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Website Structure Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Navigation</span>
                    <CheckCircle className={`w-5 h-5 ${
                      analysis.structure.hasNavigation ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Footer</span>
                    <CheckCircle className={`w-5 h-5 ${
                      analysis.structure.hasFooter ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Images</span>
                    <CheckCircle className={`w-5 h-5 ${
                      analysis.structure.hasImages ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Forms</span>
                    <CheckCircle className={`w-5 h-5 ${
                      analysis.structure.hasForms ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* App Customization */}
          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">App Customization</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="appName" className="block text-sm font-medium text-slate-700 mb-2">
                      App Name
                    </Label>
                    <Input
                      id="appName"
                      type="text"
                      placeholder="My Awesome App"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-2">
                      Target Platform
                    </Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="ios" disabled={user?.plan === 'free'}>
                          iOS {user?.plan === 'free' ? '(Pro Plan)' : ''}
                        </SelectItem>
                        <SelectItem value="desktop" disabled={user?.plan === 'free'}>
                          Desktop {user?.plan === 'free' ? '(Pro Plan)' : ''}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-2">
                      App Mode
                    </Label>
                    <RadioGroup value={mode} onValueChange={setMode}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online">Online Mode</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="offline" />
                        <Label htmlFor="offline">Offline Mode</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-2">
                      App Icon
                    </Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {appName.charAt(0).toUpperCase()}
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Icon
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Icon upload coming soon</p>
                  </div>
                  
                  <Button 
                    onClick={handleStartConversion}
                    disabled={createAppMutation.isPending}
                    className="w-full bg-gradient-to-br from-primary-600 to-primary-800"
                  >
                    {createAppMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate App
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Completion */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Estimated Time</div>
                  <div className="text-sm text-blue-700">3-5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
