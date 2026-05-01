import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-crimson-100 selection:text-crimson-900 mesh-bg">
      <header className="sticky top-0 z-[100] w-full glass border-b transition-all duration-500">
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="relative group cursor-pointer">
                <Image 
                  src="/College of Engineering_linear-crimson-WEB.png" 
                  alt="OU College of Engineering" 
                  width={240} 
                  height={70} 
                  className="relative transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="glass px-6 py-2 rounded-full hidden md:flex items-center gap-4 border-white/40 shadow-inner">
                <h1 className="text-sm font-bold tracking-tight text-foreground/90 uppercase">
                  Cybersecurity Research
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group p-1.5 rounded-xl glass border-white/40 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <Image 
                  src="/Picture5.png" 
                  alt="Lab Logo" 
                  width={90} 
                  height={35}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[center_top_-1px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="container mx-auto py-12 md:py-20 px-6 relative z-10">
          {children}
        </div>
      </main>

      <footer className="border-t bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Image src="/College of Engineering_linear-crimson-WEB.png" alt="OU" width={180} height={50} className="opacity-80" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
                Advancing cybersecurity education through interactive synthesis and research. 
                Dedicated to promoting digital literacy in the age of AI.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Supporting Partners</div>
              <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 hover:opacity-100 transition-opacity duration-500">
                <Image src="/fema.png" alt="FEMA" width={80} height={40} className="hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                <Image src="/oklahoma homeland security.png" alt="Oklahoma Homeland Security" width={150} height={75} className="hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                <Image src="/oklahoma office of homeland security.png" alt="Oklahoma Office of Homeland Security" width={80} height={40} className="hover:scale-110 transition-transform grayscale hover:grayscale-0" />
              </div>
            </div>

            <div className="flex flex-col items-end gap-6 text-right">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">Danial Ebrahimzadeh</p>
                <p className="text-xs text-crimson-700 dark:text-red-400 font-medium">PhD Student & Developer</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-8 border-crimson-200 hover:bg-crimson-50 dark:hover:bg-crimson-950/20 hover:text-crimson-700 transition-all shadow-sm"
                asChild
              >
                <a href="mailto:danial.ebrahimzadeh@ou.edu">Contact Me</a>
              </Button>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              &copy; {new Date().getFullYear()} OU INQUIRE LAB &bull; DIGITAL IDENTITY RESEARCH
            </p>
            <div className="flex gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 cursor-pointer hover:text-crimson-700 transition-colors">Privacy Policy</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 cursor-pointer hover:text-crimson-700 transition-colors">Terms of Use</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}