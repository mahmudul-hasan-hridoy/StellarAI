
"use client";

import React, { FC, memo, useState } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface LLMMarkdownProps {
  content: string;
  className?: string;
}

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
        <div key={`code-${elements.length}`} className="my-6">
          <CodeBlock 
            language={language} 
            code={code} 
            showMermaidPreview={language === 'mermaid'}
          />
        </div>
      );
      currentCodeBlock = null;
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

  return (
    <div className={cn("prose dark:prose-invert prose-sm sm:prose-base max-w-full break-words text-foreground", className)}>
      {elements}
    </div>
  );
});

// Helper to parse inline elements like bold, italic, code, etc.
function parseInlineElements(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  let currentText = '';
  
  // Process inline code, bold, italic, links
  for (let i = 0; i < text.length; i++) {
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

// No language detection needed anymore as AI provides language in code blocks

LLMMarkdown.displayName = "LLMMarkdown";
