import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { ImagePlus, Info } from "lucide-react";
import DeepfakeDemo from "@/app/deepfake-demo";

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in duration-1000 slide-in-from-bottom-8">
        {/* Hero Section */}
        <div className="relative text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Deepfake <br />
              <span className="text-crimson-800 dark:text-red-500">Education Demo</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              An educational platform for exploring the mechanics of AI-driven facial synthesis. Developed to promote digital literacy and understand synthetic media.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Academic Focus</span>
              </div>
              <div className="w-[1px] h-10 bg-border/60 mx-4"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">Secure</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sandboxed Environment</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-crimson-600 to-crimson-900 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-card border rounded-3xl p-2 shadow-2xl overflow-hidden aspect-square flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1633412802994-5c058f151b66?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="relative glass p-8 rounded-2xl text-center space-y-4 max-w-[80%] border-white/20">
                  <Info className="h-10 w-10 text-white mx-auto" />
                  <h3 className="text-white font-bold text-lg">System Protocol</h3>
                  <p className="text-white/80 text-xs leading-relaxed font-medium">
                    Neural synthesis must only be conducted within ethically approved research frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Academic Context Section */}
        <div className="max-w-4xl mx-auto glass p-10 rounded-3xl border-crimson-100/20 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-crimson-500/10 p-3 rounded-2xl">
              <Info className="h-6 w-6 text-crimson-700 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Academic Purpose</h2>
          </div>
          <p className="text-muted-foreground font-medium leading-relaxed">
            This demo is designed to help students and researchers understand how synthetic media is created. 
            The goal is to provide the visual context required to identify and mitigate the risks associated with deepfake technology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-sm font-bold text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-crimson-500"></div>
              Media Literacy Benchmark
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-crimson-500"></div>
              Ethical AI Prototyping
            </div>
          </div>
        </div>
        
        {/* Lab Section */}
        <div className="relative space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/5 p-2 rounded-lg">
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Active Workshop</h2>
              </div>
              <p className="text-muted-foreground font-medium">Configure and execute neural synthesis parameters below.</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-border/50 to-border/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-muted/30 p-1 md:p-2">
                <div className="bg-background rounded-[2rem] p-8 md:p-12">
                  <DeepfakeDemo type="image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
