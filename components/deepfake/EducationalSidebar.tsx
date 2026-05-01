import React from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { educationalContent } from '@/lib/models/deepfake';
import { CodeBlock } from '@/components/deepfake/CodeBlock';

interface EducationalSidebarProps {
  type: 'image';
}

export default function EducationalSidebar({ type }: EducationalSidebarProps) {
  const content = educationalContent.imageDeepfake;
  const pseudocode = educationalContent.pseudocode.imageSwap;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{content.title}</h2>
        <p className="text-muted-foreground mt-2">{content.introduction}</p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How It Works</h3>
        <ul className="space-y-2">
          {content.technicalExplanation.map((step, index) => (
            <li key={index} className="text-sm">{step}</li>
          ))}
        </ul>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Simplified Pseudocode</CardTitle>
          <CardDescription>
            A simplified representation of the algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={pseudocode} />
        </CardContent>
      </Card>
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">API Implementation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This demo uses the Segmind FaceSwap API to perform the deepfake operation. The API handles:
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
            <li>Face detection and alignment</li>
            <li>Face swapping with different model types (speed vs. quality)</li>
            <li>Swap options (face-only or full head swap)</li>
            <li>Style options (normal, cartoon, or artistic)</li>
          </ul>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Current Limitations</h3>
          <p className="text-sm text-muted-foreground mt-1">{content.limitations}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Ethical Considerations</h3>
          <p className="text-sm text-muted-foreground mt-1">{content.ethicalConsiderations}</p>
        </div>
      </div>
    </div>
  );
} 