"use client";

import { useState, FC, memo } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import {
  SiJavascript,
  SiReact,
  SiHtml5,
  SiCss3,
  SiPython,
  SiPhp,
  SiSwift,
  SiRust,
  SiGo,
  SiDocker,
  SiTypescript,
  SiKotlin,
  SiCplusplus,
  SiRuby,
  SiScala,
} from "react-icons/si";
import { FiCode } from "react-icons/fi";
import { TbBrandCSharp } from "react-icons/tb";
import { FaJava } from "react-icons/fa";
import type { PrismTheme } from "prism-react-renderer";

// Custom SVG component for Shell
const Shell: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    className={className}
  >
    <path
      fill="currentColor"
      d="M9.4 86.6C-3.1 74.1-3.1 53.9 9.4 41.4s32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 9.4 86.6zM256 416l288 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-288 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
    />
  </svg>
);

// Language icon mapping
const languageIcons: Record<string, FC<{ className?: string }>> = {
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  jsx: SiReact,
  tsx: SiReact,
  html: SiHtml5,
  css: SiCss3,
  python: SiPython,
  java: FaJava,
  php: SiPhp,
  swift: SiSwift,
  rust: SiRust,
  go: SiGo,
  docker: SiDocker,
  kotlin: SiKotlin,
  csharp: TbBrandCSharp,
  "c#": TbBrandCSharp,
  cpp: SiCplusplus,
  "c++": SiCplusplus,
  ruby: SiRuby,
  scala: SiScala,
  bash: Shell,
  shell: Shell,
  sh: Shell,
};

// Normalize language for prism
const normalizeLanguage = (language: string): string => {
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    "c#": "csharp",
    "c++": "cpp",
  };

  return langMap[language.toLowerCase()] || language.toLowerCase();
};

interface CodeBlockProps {
  language: string;
  fileName?: string;
  code: string;
  showMermaidPreview?: boolean;
}

export function CodeBlock({
  language,
  fileName,
  code,
  showMermaidPreview,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsFile = () => {
    const fileExtension = getFileExtension(language);
    const fileName = `code-snippet.${fileExtension}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lang = language.toLowerCase();
  const Icon = languageIcons[lang] || FiCode;
  const normalizedLanguage = normalizeLanguage(lang);

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-gray-800 bg-muted/30 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-gray-800 bg-muted/50 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-xs font-medium text-muted-foreground">
            {fileName || formatLanguageName(language)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={downloadAsFile}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only">Download code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showMermaidPreview && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">Preview diagram</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview diagram</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Highlight
          theme={customTheme}
          code={code}
          language={normalizedLanguage}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn("p-4 text-sm font-mono", className)}
              style={style}
            >
              {tokens.map((line, i) => (
                <div
                  key={i}
                  {...getLineProps({ line, key: i })}
                  className="table-row"
                >
                  <span className="table-cell pr-4 text-right select-none opacity-50 text-xs w-10">
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

// Custom theme based on dark theme but with colors matching the app's color scheme
const customTheme: PrismTheme = {
  plain: { ...themes.vsDark.plain },
  styles: [
    ...themes.vsDark.styles,
    {
      types: ["keyword", "builtin", "operator"],
      style: {
        color: "#ff9e64",
      },
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: {
        color: "#9ece6a",
      },
    },
    {
      types: ["function", "method"],
      style: {
        color: "#7aa2f7",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "#565f89",
        fontStyle: "italic",
      },
    },
    {
      types: ["number", "boolean"],
      style: {
        color: "#ff9e64",
      },
    },
    {
      types: ["class-name", "maybe-class-name", "namespace"],
      style: {
        color: "#e0af68",
      },
    },
    {
      types: ["variable", "constant"],
      style: {
        color: "#bb9af7",
      },
    },
    {
      types: ["property"],
      style: {
        color: "#7dcfff",
      },
    },
    {
      types: ["punctuation", "attr-name"],
      style: {
        color: "#c0caf5",
      },
    },
  ],
};

function formatLanguageName(language: string): string {
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript JSX",
    ts: "TypeScript",
    tsx: "TypeScript JSX",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    java: "Java",
    cs: "C#",
    cpp: "C++",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    yaml: "YAML",
    md: "Markdown",
    sql: "SQL",
    sh: "Shell",
    bash: "Bash",
    plaintext: "Plain Text",
  };

  return languageMap[language.toLowerCase()] || language;
}

function getFileExtension(language: string): string {
  const extensionMap: Record<string, string> = {
    javascript: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    jsx: "jsx",
    tsx: "tsx",
    python: "py",
    py: "py",
    ruby: "rb",
    go: "go",
    java: "java",
    csharp: "cs",
    cs: "cs",
    cpp: "cpp",
    php: "php",
    html: "html",
    css: "css",
    json: "json",
    yaml: "yml",
    markdown: "md",
    md: "md",
    sql: "sql",
    shell: "sh",
    bash: "sh",
    plaintext: "txt",
  };

  return extensionMap[language.toLowerCase()] || "txt";
}
