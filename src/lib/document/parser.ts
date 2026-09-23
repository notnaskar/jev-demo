import { extractText } from 'unpdf';

export interface ParsedDocumentResult {
  fileName: string;
  candidateName: string;
  text: string;
  totalPages?: number;
  wordCount: number;
  charCount: number;
  warning?: string;
}

/**
 * Validates whether binary data matches PDF magic bytes (%PDF-).
 */
export function isPdfBuffer(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

/**
 * Cleans up raw extracted text:
 * - Strips null bytes and unusual control codes
 * - Normalizes excessive whitespace and line breaks
 * - Preserves structural paragraphs and bullet points
 */
export function sanitizeExtractedText(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Remove null bytes and non-printable control characters (except newline, tab, carriage return)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Replace non-standard whitespace/non-breaking spaces with standard space
      .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
      // Normalize Windows CRLF to standard LF
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse excessive horizontal whitespace
      .replace(/[ \t]+/g, ' ')
      // Collapse 3+ consecutive newlines to 2
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Extracts candidate name from the top lines of a cleaned resume.
 */
export function extractCandidateName(text: string, fallbackName: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines.slice(0, 6)) {
    // Skip lines with contact information, links, or generic section headers
    if (
      /@|http|linkedin|github|portfolio|curriculum|resume|summary|profile|page\s*\d/i.test(
        line
      )
    ) {
      continue;
    }
    // Clean candidate name
    const cleaned = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
    if (
      cleaned.length >= 2 &&
      cleaned.length <= 40 &&
      !/engineer|developer|architect|designer|manager|consultant|curriculum/i.test(
        cleaned
      )
    ) {
      return cleaned;
    }
  }

  return fallbackName;
}

/**
 * In-memory document text extractor.
 * Operates purely on memory buffers (zero disk access) for security and speed.
 */
export async function extractDocumentText(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  mimeType?: string
): Promise<ParsedDocumentResult> {
  // unpdf strictly requires an instance of pure Uint8Array (rejecting Node.js Buffer wrappers)
  const uint8 =
    buffer instanceof Uint8Array
      ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new Uint8Array(buffer);
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim() || 'Candidate';
  const isPdf =
    fileName.toLowerCase().endsWith('.pdf') ||
    mimeType === 'application/pdf' ||
    isPdfBuffer(uint8);

  if (isPdf) {
    if (!isPdfBuffer(uint8)) {
      throw new Error(
        `File "${fileName}" has a .pdf extension but does not contain valid PDF headers.`
      );
    }

    try {
      const { text, totalPages } = await extractText(uint8, { mergePages: true });
      const cleanedText = sanitizeExtractedText(text);

      let warning: string | undefined;
      if (cleanedText.length < 50) {
        warning =
          'Very little or no text could be extracted from this PDF. It may be an image-only scanned document or protected.';
      }

      const candidateName = extractCandidateName(cleanedText, baseName);
      const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;

      return {
        fileName,
        candidateName,
        text: cleanedText,
        totalPages: totalPages || 1,
        wordCount,
        charCount: cleanedText.length,
        warning,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Corrupted file';
      if (/password/i.test(message)) {
        throw new Error(`File "${fileName}" is password-protected and cannot be parsed.`);
      }
      throw new Error(`Failed to parse PDF "${fileName}": ${message}`);
    }
  }

  // Fallback for Plain Text (.txt) or Markdown (.md)
  const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
  const rawText = decoder.decode(uint8);
  const cleanedText = sanitizeExtractedText(rawText);
  const candidateName = extractCandidateName(cleanedText, baseName);
  const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;

  return {
    fileName,
    candidateName,
    text: cleanedText,
    totalPages: 1,
    wordCount,
    charCount: cleanedText.length,
  };
}
