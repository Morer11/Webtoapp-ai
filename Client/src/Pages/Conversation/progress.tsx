import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, CheckCircle, Clock } from "lucide-react";
import type { App } from "@shared/schema";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export default function ProgressPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);

  const { data: app, isLoading } = useQuery<App>({
    queryKey: [`/api/apps/${id}`],
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!id,
  });

  useEffect(() => {
    if (app?.status === 'completed') {
      setLocation(`/conversion/complete/${id}`);
    } else if (app?.status === 'failed') {
      setLocation('/dashboard');
    }
  }, [app?.status, id, setLocation]);

  useEffect(() => {
    // Simulate progress based on status
    if (app) {
      switch (app.status) {
        case 'pending':
          setProgress(10);
          break;
        case 'analyzing':
          setProgress(30);
          break;
        case 'generating':
          setProgress(75);
          break;
        case 'completed':
          setProgress(100);
          break;
        default:
          setProgress(0);
      }
    }
  }, [app?.status]);

  const getProgressSteps = (): ProgressStep[] => {
    const currentStatus = app?.status || 'pending';
    
    return [
      {
        id: 'analysis',
        title: 'Website Analysis',
        description: 'Analyzed website structure and content',
        completed: ['analyzing', 'generating', 'completed'].includes(currentStatus),
        current: currentStatus === 'pending'
      },
      {
        id: 'generation',
        title: 'Code Generation',
        description: 'Generated native app code structure',
        completed: ['generating', 'completed'].includes(currentStatus),
        current: currentStatus === 'analyzing'
      },
      {
        id: 'compilation',
        title: 'App Compilation',
        description: 'Building and optimizing app package',
        completed: currentStatus === 'completed',
        current: currentStatus === 'generating'
      },
      {
        id: 'packaging',
        title: 'Final Package',
        description: 'Creating downloadable app package',
        completed: false,
        current: false
      }
    ];
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

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">App not found</p>
        </div>
      </div>
    );
  }

  const progressSteps = getProgressSteps();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Generating Your App</h1>
            <p className="text-slate-600">Our AI is converting your website into a mobile app</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Animation */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="w-32 h-32 border-8 border-slate-200 rounded-full"></div>
            <div 
              className="w-32 h-32 border-8 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
              style={{
                animation: app.status === 'completed' ? 'none' : undefined,
                borderTopColor: app.status === 'completed' ? 'hsl(221, 83%, 53%)' : 'transparent'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">{progress}%</div>
          <div className="text-slate-600">
            {app.status === 'pending' && 'Initializing conversion process...'}
            {app.status === 'analyzing' && 'Analyzing website structure...'}
            {app.status === 'generating' && 'Optimizing app performance...'}
            {app.status === 'completed' && 'Conversion completed!'}
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="p-8">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Conversion Progress</h3>
            
            <div className="space-y-6">
              {progressSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    step.completed 
                      ? 'bg-green-600 text-white' 
                      : step.current 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : step.current ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      step.completed || step.current ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-sm ${
                      step.completed || step.current ? 'text-slate-600' : 'text-slate-500'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    step.completed 
                      ? 'text-green-600' 
                      : step.current 
                        ? 'text-primary-600' 
                        : 'text-slate-500'
                  }`}>
                    {step.completed ? 'Completed' : step.current ? 'In Progress' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <div className="flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-center">
              <div className="font-medium text-blue-900">Estimated time remaining</div>
              <div className="text-xl font-bold text-blue-900">
                {app.status === 'pending' && '4-5 minutes'}
                {app.status === 'analyzing' && '3-4 minutes'}
                {app.status === 'generating' && '1-2 minutes'}
                {app.status === 'completed' && 'Complete!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
