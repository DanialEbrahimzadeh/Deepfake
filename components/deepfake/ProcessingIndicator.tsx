import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, CircleAlert, Clock, Cpu, Activity, Zap } from 'lucide-react';
import { ProcessingStep } from '@/lib/models/deepfake';

interface ProcessingIndicatorProps {
  progress: number;
  currentStep: ProcessingStep | null;
  steps: ProcessingStep[];
  type: 'image' | 'video';
}

export default function ProcessingIndicator({
  progress,
  currentStep,
  steps,
  type
}: ProcessingIndicatorProps) {
  return (
    <div className="space-y-10 w-full animate-in fade-in duration-700">
      <div className="relative glass p-10 rounded-[2rem] overflow-hidden border-white/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-crimson-600 via-crimson-400 to-crimson-600 animate-pulse"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <h3 className="text-3xl font-black tracking-tight uppercase">Processing {type}</h3>
            <p className="text-sm text-muted-foreground max-w-sm font-medium">
              Generating the demonstration based on your inputs.
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-5xl font-black font-mono text-crimson-800 dark:text-red-500 tabular-nums">
              {progress}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">System Progress</span>
          </div>
        </div>
        
        <div className="mt-8 relative">
          <Progress value={progress} className="h-3 bg-muted shadow-inner" />
          <div className="absolute -top-1 right-0 h-5 w-5 bg-background border-2 border-crimson-600 rounded-full flex items-center justify-center shadow-lg transform translate-x-1/2" style={{ left: `${progress}%` }}>
            <Zap className="h-2 w-2 text-crimson-600 fill-crimson-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-2 rounded-lg">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-widest">Execution Pipeline</h4>
          </div>
          
          <div className="space-y-3 relative before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
            {steps.map((step, index) => {
              const isCurrent = currentStep?.name === step.name;
              const isComplete = step.complete;
              const isPending = !step.complete && !isCurrent;

              return (
                <div key={index} className={`flex items-start gap-4 transition-all duration-300 relative ${isCurrent ? 'scale-[1.02] pl-2' : ''}`}>
                  <div className={`mt-1 z-10 p-0.5 rounded-full bg-background border-2 transition-colors duration-500 ${
                    isComplete ? 'border-green-500 bg-green-50' : 
                    isCurrent ? 'border-crimson-600 bg-crimson-50 animate-pulse' : 
                    'border-border'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : isCurrent ? (
                      <Zap className="h-3 w-3 text-crimson-600" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      isComplete ? 'text-green-600' : 
                      isCurrent ? 'text-crimson-800 dark:text-red-400' : 
                      'text-muted-foreground/60'
                    }`}>
                      {step.name}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-muted-foreground font-medium animate-in fade-in slide-in-from-left-2">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="glass-dark p-8 rounded-3xl flex flex-col justify-center items-center text-center space-y-6 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop')] bg-cover opacity-10"></div>
          <Activity className="h-12 w-12 text-crimson-500 animate-pulse" />
          <div className="space-y-2">
            <h5 className="text-lg font-bold">Tensor Computation</h5>
            <p className="text-xs text-white/60 leading-relaxed font-medium">
              System is optimizing facial landmark coefficients and skin texture gradients for high-fidelity synthesis.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 