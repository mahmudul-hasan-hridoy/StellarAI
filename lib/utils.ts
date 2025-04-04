import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a filename by preserving start characters and extension
 * @param filename The filename to truncate
 * @param startChars Number of characters to show at the start (default: 8)
 * @param maxLength Maximum total length of the result (default: 20)
 * @returns Truncated filename with extension preserved
 */
export function truncateFilename(
  filename: string,
  startChars = 8,
  maxLength = 20,
): string {
  if (!filename) return "";
  if (filename.length <= maxLength) return filename;

  const lastDotIndex = filename.lastIndexOf(".");

  // If no extension or it's a hidden file (starts with dot)
  if (lastDotIndex <= 0) {
    return `${filename.slice(0, startChars)}...`;
  }

  const extension = filename.slice(lastDotIndex);
  const nameWithoutExt = filename.slice(0, lastDotIndex);

  // If name without extension is already shorter than startChars
  if (nameWithoutExt.length <= startChars) {
    return filename;
  }

  // Calculate how many characters we can display
  const availableSpace = maxLength - startChars - 3 - extension.length; // 3 for "..."

  if (availableSpace <= 0) {
    // Not enough space, just show beginning and extension
    return `${nameWithoutExt.slice(0, startChars)}...${extension}`;
  }

  return `${nameWithoutExt.slice(0, startChars)}...${extension}`;
}
