
"use client";

import React, { FC, memo, useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, ExternalLink, ArrowLeft, Circle } from "lucide-react";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// Initialize services
hljs.configure({
  languages: [
    "javascript",
    "typescript",
    "html",
    "css",
    "bash",
    "json",
    "python",
    "java",
    "ruby",
    "php",
    "c",
    "cpp",
    "go",
    "rust",
  ],
});

// Constants
const ANCHOR_CLASS_NAME = "text-primary hover:underline font-medium transition-colors";

interface LLMMarkdownProps {
  content: string;
  className?: string;
}

// MermaidDiagram Component
interface MermaidProps {
  content: string;
}

const MermaidDiagram: FC<MermaidProps> = ({ content }) => {
  const [diagram, setDiagram] = useState<string | boolean>(true);
  
  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
    
    const render = async () => {
      try {
        const id = `mermaid-svg-${Math.round(Math.random() * 10000000)}`;
        if (await mermaid.parse(content, { suppressErrors: true })) {
          const { svg } = await mermaid.render(id, content);
          setDiagram(svg);
        } else {
          setDiagram(false);
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setDiagram(false);
      }
    };
    render();
  }, [content]);

  if (diagram === true) {
    return (
      <div className="flex gap-2 items-center">
        <Circle className="animate-spin w-4 h-4" />
        <p className="text-sm">Rendering diagram...</p>
      </div>
    );
  }

  if (diagram === false) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to render this diagram. Try copying it into the{" "}
        <Link
          href="https://mermaid.live/edit"
          className={ANCHOR_CLASS_NAME}
          target="_blank"
        >
          Mermaid Live Editor
        </Link>
        .
      </p>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: diagram }} />;
};

// Enhanced Code Block with Copy Button
interface EnhancedCodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

const EnhancedCodeBlock: FC<EnhancedCodeBlockProps> = ({ language, code, className }) => {
  const [copied, setCopied] = useState(false);
  const [showMermaidPreview, setShowMermaidPreview] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  const isMermaid = language === "mermaid";

  // Highlight code on mount and update
  useEffect(() => {
    if (ref.current && !isMermaid) {
      hljs.highlightElement(ref.current);
    }
  }, [code, isMermaid]);

  useEffect(() => {
    if (copied) {
      const interval = setTimeout(() => setCopied(false), 1000);
      return () => clearTimeout(interval);
    }
  }, [copied]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <div className="relative my-4 group">
      <div className="overflow-auto rounded-md bg-muted">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted">
          <div className="text-xs text-muted-foreground">
            {language}
          </div>
          <div className="flex gap-1">
            <button
              onClick={copyToClipboard}
              className="h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            {isMermaid && (
              <>
                <button
                  onClick={() => setShowMermaidPreview(true)}
                  className="h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <Dialog
                  open={showMermaidPreview}
                  onOpenChange={setShowMermaidPreview}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mermaid Diagram Preview</DialogTitle>
                    </DialogHeader>
                    <MermaidDiagram content={code} />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
        
        {isMermaid ? (
          <pre className="p-4 text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        ) : (
          <pre className="p-4 text-sm">
            <code ref={ref} className={cn("hljs language-" + language)}>
              {code}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
};

export const LLMMarkdown: FC<LLMMarkdownProps> = memo(({ content, className }) => {
  if (!content || content.trim() === '') {
    return null;
  }

  // Parse the markdown content
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');
  
  let currentParagraph: string[] = [];
  let currentCodeBlock: { language: string; code: string[] } | null = null;
  let currentListItems: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let inBlockQuote = false;
  let blockQuoteContent: string[] = [];
  let inMath = false;
  let mathContent: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed text-foreground">
          {parseInlineElements(currentParagraph.join('\n'))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushCodeBlock = () => {
    if (currentCodeBlock) {
      const code = currentCodeBlock.code.join('\n');
      // Use language directly from markdown code block
      let language = currentCodeBlock.language || 'plaintext';
      
      elements.push(
        <EnhancedCodeBlock 
          key={`code-${elements.length}`}
          language={language} 
          code={code} 
        />
      );
      currentCodeBlock = null;
    }
  };

  const flushMath = () => {
    if (mathContent.length > 0) {
      const mathString = mathContent.join('\n');
      // Render using KaTeX
      try {
        const html = katex.renderToString(mathString, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#ff0000',
        });
        elements.push(
          <div 
            key={`math-${elements.length}`} 
            className="my-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        elements.push(
          <div key={`math-error-${elements.length}`} className="text-red-500">
            Error rendering math: {mathString}
          </div>
        );
      }
      mathContent = [];
      inMath = false;
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      const ListTag = currentListType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-${elements.length}`} className={cn("mb-4 pl-6", 
          currentListType === 'ol' ? "list-decimal" : "list-disc"
        )}>
          {currentListItems.map((item, i) => (
            <li key={i} className="mb-1.5 text-foreground">
              {parseInlineElements(item)}
            </li>
          ))}
        </ListTag>
      );
      currentListItems = [];
      currentListType = null;
    }
  };

  const flushBlockQuote = () => {
    if (inBlockQuote && blockQuoteContent.length > 0) {
      elements.push(
        <blockquote 
          key={`blockquote-${elements.length}`} 
          className="border-l-4 border-primary/60 pl-4 italic mb-5 py-1 text-muted-foreground"
        >
          {parseInlineElements(blockQuoteContent.join('\n'))}
        </blockquote>
      );
      blockQuoteContent = [];
      inBlockQuote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Math blocks with $$ (KaTeX)
    if (line.trim() === '$$') {
      if (inMath) {
        flushMath();
      } else {
        flushParagraph();
        flushList();
        flushBlockQuote();
        inMath = true;
      }
      continue;
    }
    
    if (inMath) {
      mathContent.push(line);
      continue;
    }
    
    // Code blocks
    if (line.startsWith('```')) {
      if (currentCodeBlock) {
        flushCodeBlock();
      } else {
        flushParagraph();
        flushList();
        flushBlockQuote();
        // Extract language from opening code fence
        const language = line.slice(3).trim();
        currentCodeBlock = { language, code: [] };
      }
      continue;
    }
    
    if (currentCodeBlock) {
      currentCodeBlock.code.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      flushBlockQuote();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-2xl font-bold mb-4 mt-6 text-foreground">
          {parseInlineElements(line.slice(2))}
        </h1>
      );
      continue;
    }
    
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      flushBlockQuote();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xl font-bold mb-3 mt-5 text-foreground">
          {parseInlineElements(line.slice(3))}
        </h2>
      );
      continue;
    }
    
    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      flushBlockQuote();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-semibold mb-3 mt-4 text-foreground">
          {parseInlineElements(line.slice(4))}
        </h3>
      );
      continue;
    }
    
    if (line.startsWith('#### ')) {
      flushParagraph();
      flushList();
      flushBlockQuote();
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-base font-semibold mb-2 mt-3 text-foreground">
          {parseInlineElements(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      flushParagraph();
      flushList();
      flushBlockQuote();
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-6 border-gray-700" />
      );
      continue;
    }

    // Lists
    if (line.match(/^\d+\.\s/)) {
      flushParagraph();
      flushBlockQuote();
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      currentListItems.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }
    
    if (line.match(/^[\*\-]\s/)) {
      flushParagraph();
      flushBlockQuote();
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      currentListItems.push(line.replace(/^[\*\-]\s/, ''));
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      inBlockQuote = true;
      blockQuoteContent.push(line.slice(2));
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      flushBlockQuote();
      continue;
    }

    // Regular paragraph
    if (inBlockQuote) {
      blockQuoteContent.push(line);
    } else {
      currentParagraph.push(line);
    }
  }

  // Flush any remaining content
  flushParagraph();
  flushCodeBlock();
  flushList();
  flushBlockQuote();
  flushMath();

  return (
    <div className={cn("prose dark:prose-invert prose-sm sm:prose-base max-w-full break-words text-foreground", className)}>
      {elements}
    </div>
  );
});

// Helper to parse inline elements like bold, italic, code, math, etc.
function parseInlineElements(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  let currentText = '';
  
  // Process inline code, bold, italic, links, math
  for (let i = 0; i < text.length; i++) {
    // Inline math with $
    if (text[i] === '$' && text.indexOf('$', i + 1) !== -1 && text[i-1] !== '\\') {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const endIndex = text.indexOf('$', i + 1);
      const mathText = text.slice(i + 1, endIndex);
      
      try {
        const html = katex.renderToString(mathText, {
          displayMode: false,
          throwOnError: false,
          errorColor: '#ff0000',
        });
        
        segments.push(
          <span 
            key={segments.length}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (error) {
        segments.push(
          <span key={segments.length} className="text-red-500">
            ${mathText}$
          </span>
        );
      }
      
      i = endIndex;
      continue;
    }
    
    // Inline code with `
    if (text[i] === '`' && text.indexOf('`', i + 1) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const endIndex = text.indexOf('`', i + 1);
      const code = text.slice(i + 1, endIndex);
      
      segments.push(
        <code key={segments.length} className="px-1.5 py-0.5 rounded bg-muted/50 text-xs sm:text-sm font-mono text-primary-foreground">
          {code}
        </code>
      );
      
      i = endIndex;
      continue;
    }
    
    // Bold with **
    if (text[i] === '*' && text[i + 1] === '*' && text.indexOf('**', i + 2) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const endIndex = text.indexOf('**', i + 2);
      const boldText = text.slice(i + 2, endIndex);
      
      segments.push(
        <strong key={segments.length} className="font-semibold">
          {parseInlineElements(boldText)}
        </strong>
      );
      
      i = endIndex + 1;
      continue;
    }
    
    // Italic with *
    if (text[i] === '*' && text[i + 1] !== '*' && text.indexOf('*', i + 1) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const endIndex = text.indexOf('*', i + 1);
      const italicText = text.slice(i + 1, endIndex);
      
      segments.push(
        <em key={segments.length} className="italic">
          {parseInlineElements(italicText)}
        </em>
      );
      
      i = endIndex;
      continue;
    }
    
    // Links with [text](url)
    if (text[i] === '[' && text.indexOf('](', i) !== -1 && text.indexOf(')', text.indexOf('](', i)) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const textEndIndex = text.indexOf('](', i);
      const linkEndIndex = text.indexOf(')', textEndIndex);
      
      const linkText = text.slice(i + 1, textEndIndex);
      const linkUrl = text.slice(textEndIndex + 2, linkEndIndex);
      
      segments.push(
        <a 
          key={segments.length} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium transition-colors"
        >
          {linkText}
        </a>
      );
      
      i = linkEndIndex;
      continue;
    }
    
    // Strikethrough with ~~
    if (text[i] === '~' && text[i + 1] === '~' && text.indexOf('~~', i + 2) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = '';
      }
      
      const endIndex = text.indexOf('~~', i + 2);
      const strikethroughText = text.slice(i + 2, endIndex);
      
      segments.push(
        <del key={segments.length} className="line-through opacity-75">
          {parseInlineElements(strikethroughText)}
        </del>
      );
      
      i = endIndex + 1;
      continue;
    }
    
    currentText += text[i];
  }
  
  if (currentText) {
    segments.push(currentText);
  }
  
  return segments;
}

LLMMarkdown.displayName = "LLMMarkdown";
