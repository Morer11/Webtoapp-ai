import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Download, Smartphone, ExternalLink } from "lucide-react";
import type { App } from "@shared/schema";

export default function CompletePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: app, isLoading } = useQuery<App>({
    queryKey: [`/api/apps/${id}`],
    enabled: !!id,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!app || app.status !== 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">App not found or not completed</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">App Generated Successfully!</h1>
          <p className="text-xl text-slate-600">Your website has been converted into a mobile app</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* App Details */}
          <Card className="p-8">
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">App Details</h3>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-4">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{app.name}</h4>
                  <p className="text-slate-600 capitalize">{app.platform} App</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">File Size</span>
                  <span className="font-medium text-slate-900">
                    {app.fileSize ? formatFileSize(app.fileSize) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform</span>
                  <span className="font-medium text-slate-900 capitalize">{app.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mode</span>
                  <span className="font-medium text-slate-900 capitalize">{app.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Generated</span>
                  <span className="font-medium text-slate-900">
                    {app.completedAt ? formatDate(app.completedAt) : 'Just now'}
                  </span>
                </div>
                {app.websiteUrl && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Source</span>
                    <a 
                      href={app.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
                    >
                      View Website
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-8 space-y-4">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-br from-primary-600 to-primary-800 text-lg py-6"
                >
                  <a href={`/api/apps/${app.id}/download`}>
                    <Download className="w-5 h-5 mr-2" />
                    Download {app.platform === 'android' ? 'APK' : app.platform === 'ios' ? 'IPA' : 'EXE'}
                  </a>
                </Button>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-6">
            {/* Installation Guide */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Installation Guide</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  {app.platform === 'android' && (
                    <>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                        <p>Download the APK file to your Android device</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                        <p>Enable "Install from unknown sources" in Android settings</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                        <p>Open the APK file and follow installation prompts</p>
                      </div>
                    </>
                  )}
                  {app.platform === 'ios' && (
                    <>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                        <p>Install using Apple Configurator or TestFlight</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                        <p>Trust the developer certificate in device settings</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                        <p>Launch the app from your home screen</p>
                      </div>
                    </>
                  )}
                  {app.platform === 'desktop' && (
                    <>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                        <p>Download the executable file to your computer</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                        <p>Run the installer and follow the setup wizard</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                        <p>Launch the app from your desktop or start menu</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Suggestion */}
            {user?.plan === 'free' && (
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upgrade to Pro</h3>
                <p className="text-slate-600 mb-4">Unlock iOS and Desktop app generation, unlimited conversions, and more features.</p>
                <Link href="/pricing-upgrade">
                  <Button className="bg-gradient-to-br from-primary-600 to-primary-800">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Create Another App */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Another App</h3>
                <p className="text-slate-600 mb-4">Ready to convert another website? Start a new conversion project.</p>
                <Link href="/conversion">
                  <Button variant="outline" className="w-full">
                    <Smartphone className="w-4 h-4 mr-2" />
                    New Conversion
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Success</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" size="sm" disabled>
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Copy Link
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Sharing features coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
