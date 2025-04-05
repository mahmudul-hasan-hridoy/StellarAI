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
import {
  Check,
  Copy,
  ExternalLink,
  ArrowLeft,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
const ANCHOR_CLASS_NAME =
  "text-primary hover:underline font-medium transition-colors";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    });

    const render = async () => {
      try {
        const id = `mermaid-svg-${Math.round(Math.random() * 10000000)}`;
        const { svg } = await mermaid.render(id, content);
        setDiagram(svg);
        setError(null);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setDiagram(false);
        setError(error instanceof Error ? error.message : String(error));
      }
    };
    render();
  }, [content]);

  if (diagram === true) {
    return (
      <div className="flex gap-2 items-center justify-center p-4 w-full">
        <Circle className="animate-spin w-4 h-4 text-primary" />
        <p className="text-sm">Rendering diagram...</p>
      </div>
    );
  }

  if (diagram === false) {
    return (
      <div className="border border-red-500/20 bg-red-500/10 rounded-md p-4 my-4">
        <p className="text-sm text-red-400 mb-2 font-medium">
          Error rendering diagram
        </p>
        {error && (
          <pre className="text-xs overflow-auto p-2 bg-muted/20 rounded">
            {error}
          </pre>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Try copying it into the{" "}
          <Link
            href="https://mermaid.live/edit"
            className={ANCHOR_CLASS_NAME}
            target="_blank"
          >
            Mermaid Live Editor
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="my-4 w-full overflow-auto p-1">
      <div className="mx-auto" dangerouslySetInnerHTML={{ __html: diagram }} />
    </div>
  );
};

// Enhanced Code Block with Copy Button
interface EnhancedCodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

const EnhancedCodeBlock: FC<EnhancedCodeBlockProps> = ({
  language,
  code,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMermaidPreview, setShowMermaidPreview] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const isMermaid = language.toLowerCase() === "mermaid";

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
      <div className="overflow-auto rounded-md bg-muted/80 border border-muted-foreground/20">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/90">
          <div className="text-xs text-muted-foreground flex items-center">
            {isMermaid ? (
              <span className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="text-primary"
                >
                  <path
                    fill="currentColor"
                    d="M12 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 4a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM2 12.5C2 7.25 6.25 3 11.5 3S21 7.25 21 12.5c0 .54-.04 1.06-.13 1.58l.68.13a.5.5 0 0 1 .4.48v1.6a.5.5 0 0 1-.4.49l-.75.14c-.17.33-.37.65-.58.95l.34.67c.1.2.06.44-.1.6l-1.13 1.12a.5.5 0 0 1-.6.1l-.67-.33a7.4 7.4 0 0 1-.95.57l-.15.76a.5.5 0 0 1-.48.39h-1.6a.5.5 0 0 1-.48-.39l-.15-.76a7.65 7.65 0 0 1-.95-.57l-.67.33a.5.5 0 0 1-.6-.09l-1.13-1.13a.5.5 0 0 1-.09-.6l.33-.67a7.65 7.65 0 0 1-.57-.95l-.76-.15A.5.5 0 0 1 2 16.3v-1.6a.5.5 0 0 1 .39-.48l.76-.15c.17-.33.37-.65.57-.95l-.33-.67a.5.5 0 0 1 .09-.6L4.6 10.7a.5.5 0 0 1 .6-.1l.67.34c.3-.21.62-.4.95-.58l.15-.75A.5.5 0 0 1 7.45 9h1.6c.21 0 .4.14.48.39l.15.75c.33.18.64.37.95.58l.67-.34a.5.5 0 0 1 .6.1l1.13 1.13c.16.16.2.4.1.6l-.34.67c.21.3.4.62.58.95l.75.15a.5.5 0 0 1 .39.48v1.6a.5.5 0 0 1-.39.48l-.75.15a7.12 7.12 0 0 1-.58.95l.34.67c.1.2.06.44-.1.6l-1.13 1.13a.5.5 0 0 1-.6.09l-.67-.33a7.65 7.65 0 0 1-.95.57l-.15.76a.5.5 0 0 1-.48.39h-1.6a.5.5 0 0 1-.48-.39l-.15-.76a7.4 7.4 0 0 1-.95-.57l-.67.33a.5.5 0 0 1-.6-.09L5.84 17.7a.5.5 0 0 1-.1-.6l.33-.67a7.65 7.65 0 0 1-.57-.95l-.76-.15A.5.5 0 0 1 4.36 15v-1.09A8.46 8.46 0 0 1 2 8.5Z"
                  />
                </svg>
                <span className="ml-1">mermaid</span>
              </span>
            ) : (
              <span>{language}</span>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={copyToClipboard}
              className="h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            {isMermaid && (
              <>
                <button
                  onClick={() => setShowMermaidPreview(true)}
                  className="h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
                  aria-label="Preview diagram"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <Dialog
                  open={showMermaidPreview}
                  onOpenChange={setShowMermaidPreview}
                >
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Mermaid Diagram Preview</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-auto p-2">
                      <MermaidDiagram content={code} />
                    </div>
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
      {isMermaid && (
        <div className="mt-2">
          <MermaidDiagram content={code} />
        </div>
      )}
    </div>
  );
};

// Table component
interface TableProps {
  header: string[];
  rows: string[][];
}

const Table: FC<TableProps> = ({ header, rows }) => {
  return (
    <div className="my-4 w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-muted-foreground/20">
            {header.map((cell, i) => (
              <th
                key={i}
                className="py-2 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {parseInlineElements(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-muted-foreground/10",
                i % 2 === 0 ? "bg-transparent" : "bg-muted/20",
              )}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-4 text-sm">
                  {parseInlineElements(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Collapsible details component
interface DetailsProps {
  summary: string;
  children: React.ReactNode;
}

const Details: FC<DetailsProps> = ({ summary, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 border border-muted-foreground/20 rounded-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{parseInlineElements(summary)}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-muted-foreground/20">
          {children}
        </div>
      )}
    </div>
  );
};

export const LLMMarkdown: FC<LLMMarkdownProps> = memo(
  ({ content, className }) => {
    if (!content || content.trim() === "") {
      return null;
    }

    // Parse the markdown content
    const elements: React.ReactNode[] = [];
    const lines = content.split("\n");

    let currentParagraph: string[] = [];
    let currentCodeBlock: { language: string; code: string[]; filename?: string } | null = null;
    let currentListItems: string[] = [];
    let currentListType: "ul" | "ol" | null = null;
    let inBlockQuote = false;
    let blockQuoteContent: string[] = [];
    let inMath = false;
    let mathContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeader: string[] = [];
    let inDetails = false;
    let detailsSummary: string = "";
    let detailsContent: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p
            key={`p-${elements.length}`}
            className="mb-4 leading-relaxed text-foreground"
          >
            {parseInlineElements(currentParagraph.join("\n"))}
          </p>,
        );
        currentParagraph = [];
      }
    };

    const flushCodeBlock = () => {
      if (currentCodeBlock) {
        const code = currentCodeBlock.code.join("\n");
        // Use language directly from markdown code block
        let language = currentCodeBlock.language || "plaintext";

        elements.push(
          <EnhancedCodeBlock
            key={`code-${elements.length}`}
            language={language}
            code={code}
          />,
        );
        currentCodeBlock = null;
      }
    };

    const flushMath = () => {
      if (mathContent.length > 0) {
        const mathString = mathContent.join("\n");
        // Render using KaTeX
        try {
          const html = katex.renderToString(mathString, {
            displayMode: true,
            throwOnError: false,
            errorColor: "#ff0000",
          });
          elements.push(
            <div
              key={`math-${elements.length}`}
              className="my-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />,
          );
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          elements.push(
            <div key={`math-error-${elements.length}`} className="text-red-500">
              Error rendering math: {mathString}
            </div>,
          );
        }
        mathContent = [];
        inMath = false;
      }
    };

    const flushList = () => {
      if (currentListItems.length > 0) {
        const ListTag = currentListType === "ol" ? "ol" : "ul";
        elements.push(
          <ListTag
            key={`list-${elements.length}`}
            className={cn(
              "mb-4 pl-6",
              currentListType === "ol" ? "list-decimal" : "list-disc",
            )}
          >
            {currentListItems.map((item, i) => (
              <li key={i} className="mb-1.5 text-foreground">
                {parseInlineElements(item)}
              </li>
            ))}
          </ListTag>,
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
            {parseInlineElements(blockQuoteContent.join("\n"))}
          </blockquote>,
        );
        blockQuoteContent = [];
        inBlockQuote = false;
      }
    };

    const flushTable = () => {
      if (tableHeader.length > 0 && tableRows.length > 0) {
        elements.push(
          <Table
            key={`table-${elements.length}`}
            header={tableHeader}
            rows={tableRows}
          />,
        );
        tableHeader = [];
        tableRows = [];
        inTable = false;
      }
    };

    const flushDetails = () => {
      if (inDetails && detailsSummary && detailsContent.length > 0) {
        const parsedContent = parseMarkdownContent(detailsContent.join("\n"));

        elements.push(
          <Details key={`details-${elements.length}`} summary={detailsSummary}>
            {parsedContent}
          </Details>,
        );

        detailsSummary = "";
        detailsContent = [];
        inDetails = false;
      }
    };

    // Helper function to parse table rows
    const parseTableRow = (line: string): string[] => {
      return line
        .replace(/^\||\|$/g, "") // Remove leading/trailing pipes
        .split("|")
        .map((cell) => cell.trim());
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Math blocks with $$ (KaTeX)
      if (line.trim() === "$$") {
        if (inMath) {
          flushMath();
        } else {
          flushParagraph();
          flushList();
          flushBlockQuote();
          flushTable();
          flushDetails();
          inMath = true;
        }
        continue;
      }

      if (inMath) {
        mathContent.push(line);
        continue;
      }

      // Code blocks
      if (line.startsWith("```")) {
        if (currentCodeBlock) {
          flushCodeBlock();
        } else {
          flushParagraph();
          flushList();
          flushBlockQuote();
          flushTable();
          flushDetails();
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

      // Details/summary (collapsible content)
      if (line.match(/^<details>$/i)) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        inDetails = true;
        continue;
      }

      if (inDetails && line.match(/^<summary>(.*)<\/summary>$/i)) {
        const match = line.match(/^<summary>(.*)<\/summary>$/i);
        if (match && match[1]) {
          detailsSummary = match[1].trim();
        }
        continue;
      }

      if (line.match(/^<\/details>$/i)) {
        flushDetails();
        continue;
      }

      if (inDetails) {
        detailsContent.push(line);
        continue;
      }

      // Tables
      if (line.match(/^\|(.+\|)+$/)) {
        if (!inTable) {
          flushParagraph();
          flushList();
          flushBlockQuote();
          inTable = true;
          tableHeader = parseTableRow(line);
        } else if (line.match(/^\|(\s*[-:]+\s*\|)+$/)) {
          // This is the separator line, ignore it
          continue;
        } else {
          tableRows.push(parseTableRow(line));
        }
        continue;
      }

      if (inTable && !line.match(/^\|(.+\|)+$/)) {
        flushTable();
      }

      // Headings
      if (line.startsWith("# ")) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        flushDetails();
        elements.push(
          <h1
            key={`h1-${elements.length}`}
            className="text-2xl font-bold mb-4 mt-6 text-foreground"
          >
            {parseInlineElements(line.slice(2))}
          </h1>,
        );
        continue;
      }

      if (line.startsWith("## ")) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        flushDetails();
        elements.push(
          <h2
            key={`h2-${elements.length}`}
            className="text-xl font-bold mb-3 mt-5 text-foreground"
          >
            {parseInlineElements(line.slice(3))}
          </h2>,
        );
        continue;
      }

      if (line.startsWith("### ")) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        flushDetails();
        elements.push(
          <h3
            key={`h3-${elements.length}`}
            className="text-lg font-semibold mb-3 mt-4 text-foreground"
          >
            {parseInlineElements(line.slice(4))}
          </h3>,
        );
        continue;
      }

      if (line.startsWith("#### ")) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        flushDetails();
        elements.push(
          <h4
            key={`h4-${elements.length}`}
            className="text-base font-semibold mb-2 mt-3 text-foreground"
          >
            {parseInlineElements(line.slice(5))}
          </h4>,
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
        flushParagraph();
        flushList();
        flushBlockQuote();
        flushTable();
        flushDetails();
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-6 border-gray-700" />,
        );
        continue;
      }

      // Lists
      if (line.match(/^\d+\.\s/)) {
        flushParagraph();
        flushBlockQuote();
        flushTable();
        flushDetails();
        if (currentListType !== "ol") {
          flushList();
          currentListType = "ol";
        }
        currentListItems.push(line.replace(/^\d+\.\s/, ""));
        continue;
      }

      if (line.match(/^[\*\-]\s/)) {
        flushParagraph();
        flushBlockQuote();
        flushTable();
        flushDetails();
        if (currentListType !== "ul") {
          flushList();
          currentListType = "ul";
        }
        currentListItems.push(line.replace(/^[\*\-]\s/, ""));
        continue;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        flushParagraph();
        flushList();
        flushTable();
        flushDetails();
        inBlockQuote = true;
        blockQuoteContent.push(line.slice(2));
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        flushParagraph();
        flushList();
        flushBlockQuote();
        if (inTable && tableHeader.length > 0 && tableRows.length > 0) {
          flushTable();
        }
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
    flushTable();
    flushMath();
    flushDetails();

    return (
      <div
        className={cn(
          "prose dark:prose-invert prose-sm sm:prose-base max-w-full break-words text-foreground",
          className,
        )}
      >
        {elements}
      </div>
    );
  },
);

// Helper to parse inline elements like bold, italic, code, math, etc.
function parseInlineElements(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  let currentText = "";

  // Process inline code, bold, italic, links, math
  for (let i = 0; i < text.length; i++) {
    // Inline math with $
    if (
      text[i] === "$" &&
      text.indexOf("$", i + 1) !== -1 &&
      text[i - 1] !== "\\"
    ) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const endIndex = text.indexOf("$", i + 1);
      const mathText = text.slice(i + 1, endIndex);

      try {
        const html = katex.renderToString(mathText, {
          displayMode: false,
          throwOnError: false,
          errorColor: "#ff0000",
        });

        segments.push(
          <span
            key={segments.length}
            dangerouslySetInnerHTML={{ __html: html }}
          />,
        );
      } catch (error) {
        segments.push(
          <span key={segments.length} className="text-red-500">
            ${mathText}$
          </span>,
        );
      }

      i = endIndex;
      continue;
    }

    // Inline code with `
    if (text[i] === "`" && text.indexOf("`", i + 1) !== -1) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const endIndex = text.indexOf("`", i + 1);
      const code = text.slice(i + 1, endIndex);

      segments.push(
        <code
          key={segments.length}
          className="px-1.5 py-0.5 rounded bg-muted/50 text-xs sm:text-sm font-mono text-primary-foreground"
        >
          {code}
        </code>,
      );

      i = endIndex;
      continue;
    }

    // Bold with **
    if (
      text[i] === "*" &&
      text[i + 1] === "*" &&
      text.indexOf("**", i + 2) !== -1
    ) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const endIndex = text.indexOf("**", i + 2);
      const boldText = text.slice(i + 2, endIndex);

      segments.push(
        <strong key={segments.length} className="font-semibold">
          {parseInlineElements(boldText)}
        </strong>,
      );

      i = endIndex + 1;
      continue;
    }

    // Italic with *
    if (
      text[i] === "*" &&
      text[i + 1] !== "*" &&
      text.indexOf("*", i + 1) !== -1
    ) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const endIndex = text.indexOf("*", i + 1);
      const italicText = text.slice(i + 1, endIndex);

      segments.push(
        <em key={segments.length} className="italic">
          {parseInlineElements(italicText)}
        </em>,
      );

      i = endIndex;
      continue;
    }

    // Links with [text](url)
    if (
      text[i] === "[" &&
      text.indexOf("](", i) !== -1 &&
      text.indexOf(")", text.indexOf("](", i)) !== -1
    ) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const textEndIndex = text.indexOf("](", i);
      const linkEndIndex = text.indexOf(")", textEndIndex);

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
        </a>,
      );

      i = linkEndIndex;
      continue;
    }

    // Strikethrough with ~~
    if (
      text[i] === "~" &&
      text[i + 1] === "~" &&
      text.indexOf("~~", i + 2) !== -1
    ) {
      if (currentText) {
        segments.push(currentText);
        currentText = "";
      }

      const endIndex = text.indexOf("~~", i + 2);
      const strikethroughText = text.slice(i + 2, endIndex);

      segments.push(
        <del key={segments.length} className="line-through opacity-75">
          {parseInlineElements(strikethroughText)}
        </del>,
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

// Recursive markdown parser for nested content
function parseMarkdownContent(content: string): React.ReactNode {
  const tempMarkdown = <LLMMarkdown content={content} className="p-0 m-0" />;
  return tempMarkdown;
}

LLMMarkdown.displayName = "LLMMarkdown";