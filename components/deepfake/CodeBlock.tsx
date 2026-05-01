import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'python' }: CodeBlockProps) {
  return (
    <div className="relative rounded-md bg-gray-900 dark:bg-gray-950 text-white overflow-hidden font-mono">
      <pre className="p-4 overflow-x-auto text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
} 