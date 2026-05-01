'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import FileUploader from '@/components/deepfake/FileUploader';
import EducationalSidebar from '@/components/deepfake/EducationalSidebar';
import ProcessingIndicator from '@/components/deepfake/ProcessingIndicator';
import ResultDisplay from '@/components/deepfake/ResultDisplay';
import { Lightbulb, RefreshCw, X } from 'lucide-react';
import { ProcessingStep } from '@/lib/models/deepfake';
import { createDeepfake, DeepfakeOptions, delay } from '@/lib/services/deepfake-service';
import { toast } from 'sonner';

// Maximum number of retries for API calls
const MAX_RETRIES = 2;

// Type definition for API response
interface ApiResponse {
  image?: string;
  output?: string;
  [key: string]: any;
}

// Sample images for demo purposes
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=387&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=387&auto=format&fit=crop'
];

// Fallback to local placeholders if the above URLs don't work
const FALLBACK_IMAGES = [
  '/samples/source1.jpg',
  '/samples/target1.jpg',
];

// Processing steps for the deepfake
const PROCESSING_STEPS: ProcessingStep[] = [
  { name: "Image Loading", description: "Loading and preparing source and target images", complete: false },
  { name: "Face Detection", description: "Identifying faces in source and target images", complete: false },
  { name: "Facial Landmark Detection", description: "Mapping key points on faces to understand their structure", complete: false },
  { name: "Face Alignment", description: "Aligning the source face to match the target pose", complete: false },
  { name: "Face Swapping", description: "Swapping faces between source and target images", complete: false },
  { name: "Color Correction", description: "Matching skin tones for a natural look", complete: false },
  { name: "Final Rendering", description: "Creating the final deepfake image", complete: false },
];

interface DeepfakeDemoProps {
  type: 'image';
}

export default function DeepfakeDemo({ type }: DeepfakeDemoProps) {
  const [showEducation, setShowEducation] = useState(true);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const debugLogRef = useRef<HTMLDivElement>(null);
  
  const [deepfakeOptions, setDeepfakeOptions] = useState<DeepfakeOptions>({
    model_type: 'speed',
    swap_type: 'head',
    style_type: 'normal',
    seed: Math.floor(Math.random() * 10000),
  });
  
  // Auto-scroll debug panel to bottom
  useEffect(() => {
    if (debugLogRef.current && showDebugPanel) {
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    }
  }, [debugLogs, showDebugPanel]);
  
  // Override console.log for debugging
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.includes('[DEBUG]')) {
        setDebugLogs(prev => [...prev, message]);
      }
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.includes('[ERROR]')) {
        setDebugLogs(prev => [...prev, `🔴 ${message}`]);
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);
  
  // Load sample images for demo purposes
  useEffect(() => {
    setSourceUrl(SAMPLE_IMAGES[0]);
    setTargetUrl(SAMPLE_IMAGES[1]);
    
    // Clear previous state
    setErrorMessage(null);
    setDebugLogs([]);
    setShowDebugPanel(false);
    setRetryCount(0);
  }, []);
  
  const handleSourceFileSelected = (file: File, dataUrl: string) => {
    setSourceFile(file);
    setSourceUrl(dataUrl);
    setIsComplete(false);
    setResultUrl('');
    setErrorMessage(null);
    toast.success('Source file uploaded');
  };
  
  const handleTargetFileSelected = (file: File, dataUrl: string) => {
    setTargetFile(file);
    setTargetUrl(dataUrl);
    setIsComplete(false);
    setResultUrl('');
    setErrorMessage(null);
    toast.success('Target file uploaded');
  };

  // Update processing steps based on progress
  const updateProcessingSteps = (progress: number) => {
    setProgress(progress);
    
    // Map progress percentage to processing steps
    const stepIndex = Math.min(
      Math.floor((progress / 100) * PROCESSING_STEPS.length),
      PROCESSING_STEPS.length - 1
    );
    
    const updatedSteps = [...PROCESSING_STEPS].map((step, index) => ({
      ...step,
      complete: index < stepIndex
    }));
    
    // Set the current step
    setCurrentStep(updatedSteps[stepIndex]);
    setProcessingSteps(updatedSteps);
  };
  
  // Function to process an API result
  const processApiResult = (result: string | object): string => {
    if (typeof result === 'string') {
      // If it's a base64 string
      return result.startsWith('data:') ? result : `data:image/png;base64,${result}`;
    } else {
      // Try to parse the response as an object
      const responseObj = result as unknown as ApiResponse;
      
      if (responseObj.image) {
        // If it's an object with an image property containing base64
        return responseObj.image.startsWith('data:') 
          ? responseObj.image 
          : `data:image/png;base64,${responseObj.image}`;
      } else if (responseObj.output) {
        // If it's an object with an output property
        return responseObj.output.startsWith('data:') 
          ? responseObj.output 
          : `data:image/png;base64,${responseObj.output}`;
      } else {
        // Handle unexpected response format
        console.error('[ERROR] Unexpected API response format:', responseObj);
        throw new Error('Received an invalid response from the server');
      }
    }
  };
  
  // Main processing function with automatic retry
  const handleProcessing = async () => {
    if (!sourceUrl || !targetUrl) {
      toast.error('Please provide both source and target images');
      return;
    }
    
    // Reset state
    setIsProcessing(true);
    setProgress(0);
    setIsComplete(false);
    setErrorMessage(null);
    setProcessingSteps(PROCESSING_STEPS.map(step => ({ ...step, complete: false })));
    setDebugLogs([]);
    setRetryCount(0);
    
    // Generate a new seed for each run
    const newOptions = {
      ...deepfakeOptions,
      seed: Math.floor(Math.random() * 10000)
    };
    setDeepfakeOptions(newOptions);
    
    console.log(`[DEBUG] Starting new deepfake generation with seed: ${newOptions.seed}`);
    const startTime = performance.now();
    
    await processWithRetry(sourceUrl, targetUrl, newOptions, startTime);
  };
  
  // Retry logic for processing
  const processWithRetry = async (
    sourceUrl: string,
    targetUrl: string, 
    options: DeepfakeOptions,
    startTime: number,
    currentRetry = 0
  ) => {
    try {
      // If we've already retried too many times, don't try again
      if (currentRetry > MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} retries. Please try again later.`);
      }
      
      if (currentRetry > 0) {
        console.log(`[DEBUG] Retry attempt ${currentRetry}/${MAX_RETRIES}`);
        await delay(3000); // Wait 3 seconds before retrying
        setRetryCount(currentRetry);
      }
      
      // Call the API service
      const result = await createDeepfake(
        sourceUrl,
        targetUrl,
        options,
        updateProcessingSteps
      );
      
      const resultUrl = processApiResult(result);
      
      const endTime = performance.now();
      setProcessingTime((endTime - startTime) / 1000);
      
      setResultUrl(resultUrl);
      setConfidenceScore(0.92); // Mock confidence score
      setIsComplete(true);
      toast.success('Deepfake generated successfully');
    } catch (error) {
      console.error('[ERROR] Processing failed:', error);
      
      // Check if this error is retryable
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isRateLimitError = errorMsg.includes('rate limit') || errorMsg.includes('429');
      const isServerError = errorMsg.includes('500') || errorMsg.includes('server');
      const isTimeoutError = errorMsg.includes('timeout') || errorMsg.includes('ECONNABORTED');
      
      if ((isRateLimitError || isServerError || isTimeoutError) && currentRetry < MAX_RETRIES) {
        // Retry for specific errors after a delay
        toast.info(`Retrying due to error: ${errorMsg} (Attempt ${currentRetry + 1}/${MAX_RETRIES})`);
        await processWithRetry(sourceUrl, targetUrl, options, startTime, currentRetry + 1);
        return;
      }
      
      // Extract the most useful error message
      let errorMsg2 = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMsg2 = error.message;
      } else if (typeof error === 'string') {
        errorMsg2 = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMsg2 = String(error.message);
      }
      
      setErrorMessage(errorMsg2);
      toast.error(`Failed to generate deepfake: ${errorMsg2}`);
      setShowDebugPanel(true);
      setIsProcessing(false);
    } finally {
      if (isProcessing) {
        setIsProcessing(false);
      }
    }
  };
  
  const resetDemo = () => {
    setSourceFile(null);
    setTargetFile(null);
    setSourceUrl(SAMPLE_IMAGES[0]);
    setTargetUrl(SAMPLE_IMAGES[1]);
    setResultUrl('');
    setIsProcessing(false);
    setIsComplete(false);
    setProgress(0);
    setCurrentStep(null);
    setProcessingSteps([]);
    setErrorMessage(null);
    setDebugLogs([]);
    setShowDebugPanel(false);
    setRetryCount(0);
    
    // Generate a new seed
    setDeepfakeOptions({
      ...deepfakeOptions,
      seed: Math.floor(Math.random() * 10000)
    });
    
    toast.info('Demo reset');
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className={`${showEducation ? 'lg:w-2/3' : 'w-full'} space-y-10`}>
        {!isComplete && !isProcessing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3 bg-muted/50 px-3 py-1.5 rounded-full border">
                  <Switch 
                    id="debug-toggle" 
                    checked={showDebugPanel}
                    onCheckedChange={setShowDebugPanel}
                  />
                  <label 
                    htmlFor="debug-toggle" 
                    className="text-xs font-semibold uppercase tracking-wider cursor-pointer opacity-70"
                  >
                    Debug Logs
                  </label>
                </div>
                <div className="flex items-center space-x-3 bg-muted/50 px-3 py-1.5 rounded-full border">
                  <Switch 
                    id="education-toggle" 
                    checked={showEducation}
                    onCheckedChange={setShowEducation}
                  />
                  <label 
                    htmlFor="education-toggle" 
                    className="text-xs font-semibold uppercase tracking-wider cursor-pointer opacity-70"
                  >
                    Education
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="group space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border/60 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">1</div>
                  <h3 className="text-lg font-semibold">Source Identity</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Upload the face you want to project onto the target.</p>
                <FileUploader
                  onFileSelected={handleSourceFileSelected}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                  maxSize={10 * 1024 * 1024}
                  type="image"
                />
                {sourceUrl && (
                  <div className="mt-4 relative group/img rounded-xl overflow-hidden border-2 border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-800 transition-all">
                    <img src={sourceUrl} alt="Source" className="w-full h-48 object-cover transition-transform duration-500 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-medium">Source Identity Active</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="group space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border/60 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">2</div>
                  <h3 className="text-lg font-semibold">Target Context</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Upload the image where the face will be placed.</p>
                <FileUploader
                  onFileSelected={handleTargetFileSelected}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                  maxSize={10 * 1024 * 1024}
                  type="image"
                />
                {targetUrl && (
                  <div className="mt-4 relative group/img rounded-xl overflow-hidden border-2 border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-800 transition-all">
                    <img src={targetUrl} alt="Target" className="w-full h-48 object-cover transition-transform duration-500 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-medium">Target Canvas Active</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-border/40 shadow-inner">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-slate-400" />
                Algorithm Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Swap Architecture</label>
                  <select 
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-crimson-500/20 transition-all outline-none appearance-none"
                    value={deepfakeOptions.swap_type}
                    onChange={e => setDeepfakeOptions({
                      ...deepfakeOptions,
                      swap_type: e.target.value as 'head' | 'face'
                    })}
                  >
                    <option value="head">Full Head Synthesis</option>
                    <option value="face">Facial Feature Swap</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Optimization Engine</label>
                  <select 
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-crimson-500/20 transition-all outline-none appearance-none"
                    value={deepfakeOptions.model_type}
                    onChange={e => setDeepfakeOptions({
                      ...deepfakeOptions,
                      model_type: e.target.value as 'speed' | 'quality'
                    })}
                  >
                    <option value="speed">Performance Focused</option>
                    <option value="quality">Precision Focused</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendering Style</label>
                  <select 
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-crimson-500/20 transition-all outline-none appearance-none"
                    value={deepfakeOptions.style_type}
                    onChange={e => setDeepfakeOptions({
                      ...deepfakeOptions,
                      style_type: e.target.value as 'normal'
                    })}
                  >
                    <option value="normal">Standard Neural Render</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <div className="flex-1 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deterministic Seed (Optional)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-crimson-500/20 transition-all outline-none pr-12"
                        value={deepfakeOptions.seed || ''}
                        onChange={e => setDeepfakeOptions({
                          ...deepfakeOptions,
                          seed: parseInt(e.target.value) || undefined
                        })}
                        placeholder="System default random"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin-slow opacity-20" />
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="rounded-xl h-[46px] px-6"
                    onClick={() => setDeepfakeOptions({
                      ...deepfakeOptions,
                      seed: Math.floor(Math.random() * 10000)
                    })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Seed
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  * Seeds allow for reproducible neural generations with identical input vectors.
                </p>
              </div>
            </div>
            
            {showDebugPanel && debugLogs.length > 0 && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-black/10 shadow-lg">
                <div className="bg-slate-900 text-slate-400 p-3 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">System Runtime Terminal</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] hover:text-white"
                    onClick={() => setDebugLogs([])}
                  >
                    PURGE CACHE
                  </Button>
                </div>
                <div 
                  ref={debugLogRef}
                  className="bg-black text-green-400/90 p-6 font-mono text-xs overflow-auto max-h-60 scrollbar-hide"
                >
                  {debugLogs.map((log, index) => (
                    <div key={index} className={`mb-1 ${log.includes('[ERROR]') ? 'text-red-400' : ''}`}>
                      <span className="opacity-30 mr-2">[{index.toString().padStart(3, '0')}]</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errorMessage && (
              <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in zoom-in-95 duration-300">
                <div className="bg-red-500 p-2 rounded-lg text-white">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-red-600 dark:text-red-400">Execution Failed</p>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center sm:justify-end gap-4 mt-12">
              <Button 
                variant="ghost" 
                onClick={resetDemo}
                className="rounded-full px-8 h-12 text-muted-foreground hover:text-foreground"
              >
                Reset Workshop
              </Button>
              <Button 
                onClick={handleProcessing} 
                disabled={!sourceUrl || !targetUrl}
                className="rounded-full px-10 h-12 bg-crimson-800 hover:bg-crimson-900 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
              >
                Launch Neural Synthesis
              </Button>
            </div>
          </div>
        )}
        
        {isProcessing && (
          <div className="border rounded-md p-6">
            <ProcessingIndicator
              progress={progress}
              currentStep={currentStep}
              steps={processingSteps}
              type="image"
            />
            
            {retryCount > 0 && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Retry attempt {retryCount}/{MAX_RETRIES} - waiting for API rate limit to reset...
                </p>
              </div>
            )}
            
            {showDebugPanel && debugLogs.length > 0 && (
              <div className="mt-6 border rounded-md overflow-hidden">
                <div className="bg-muted p-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Debug Logs</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDebugLogs([])}
                  >
                    Clear
                  </Button>
                </div>
                <div 
                  ref={debugLogRef}
                  className="bg-black text-green-400 p-4 font-mono text-xs overflow-auto max-h-60"
                >
                  {debugLogs.map((log, index) => (
                    <div key={index} className={log.includes('[ERROR]') ? 'text-red-400' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {isComplete && resultUrl && (
          <>
            <ResultDisplay
              type="image"
              sourceUrl={sourceUrl}
              targetUrl={targetUrl}
              resultUrl={resultUrl}
              processingTime={processingTime}
              confidenceScore={confidenceScore}
            />
            
            {showDebugPanel && debugLogs.length > 0 && (
              <div className="mt-6 border rounded-md overflow-hidden">
                <div className="bg-muted p-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Debug Logs</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDebugLogs([])}
                  >
                    Clear
                  </Button>
                </div>
                <div 
                  ref={debugLogRef}
                  className="bg-black text-green-400 p-4 font-mono text-xs overflow-auto max-h-60"
                >
                  {debugLogs.map((log, index) => (
                    <div key={index} className={log.includes('[ERROR]') ? 'text-red-400' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={resetDemo}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
      
      {showEducation && (
        <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Educational Information</h2>
          </div>
          <EducationalSidebar type="image" />
        </div>
      )}
    </div>
  );
} 