import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Download, Share2, ShieldCheck, Zap, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultDisplayProps {
  type: 'image';
  sourceUrl: string;
  targetUrl: string;
  resultUrl: string;
  processingTime: number;
  confidenceScore?: number;
}

export default function ResultDisplay({
  sourceUrl,
  targetUrl,
  resultUrl,
  processingTime,
  confidenceScore
}: ResultDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = 'neural-synthesis-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Synthesis Result</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Process Time</span>
              <span className="text-sm font-bold font-mono">{processingTime.toFixed(2)}s</span>
            </div>
          </div>
          {confidenceScore && (
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="bg-crimson-500/10 p-1.5 rounded-lg">
                <Zap className="h-4 w-4 text-crimson-700 dark:text-red-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Confidence</span>
                <span className="text-sm font-bold font-mono">{(confidenceScore * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-crimson-600 to-crimson-900 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-700"></div>
        <div className="relative glass rounded-[2.5rem] p-10 md:p-16 flex flex-col items-center gap-10">
          <div className="relative w-full max-w-2xl aspect-square rounded-2xl overflow-hidden shadow-2xl border-white/20">
            <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="glass-dark px-3 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest">
                Synthetic Output
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full px-8 h-12 glass border-white/40 shadow-sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload} className="rounded-full px-10 h-12 bg-crimson-800 hover:bg-crimson-900 text-white shadow-xl shadow-crimson-900/20">
              <Download className="h-4 w-4 mr-2" />
              Download Result
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">Comparative Matrix</h3>
          <div className="flex-1 h-[1px] bg-border/40"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Source Identity', url: sourceUrl },
            { label: 'Target Context', url: targetUrl },
            { label: 'Synthetic Result', url: resultUrl }
          ].map((item, idx) => (
            <div key={idx} className="space-y-4 group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border bg-muted shadow-sm transition-all duration-500 group-hover:shadow-md">
                <img src={item.url} alt={item.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-3 left-3 glass px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                  {idx.toString().padStart(2, '0')}
                </div>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-center opacity-70 group-hover:opacity-100 transition-opacity">
                {item.label}
              </h4>
            </div>
          ))}
        </div>
      </div>
      
      <div className="glass p-8 rounded-3xl border-amber-500/10 bg-amber-500/[0.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldCheck className="h-24 w-24 text-amber-500" />
        </div>
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-2">Academic Accountability</h4>
        <p className="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-medium">
          The synthetic artifact generated above is the product of neural interpolation. This research module is designed to demonstrate 
          the convergence of high-fidelity AI and media verification protocols. Unauthorized distribution of synthetic likenesses 
          without explicit consent is a violation of ethical research mandates.
        </p>
      </div>
    </div>
  );
} 