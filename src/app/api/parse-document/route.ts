import { NextRequest, NextResponse } from 'next/server';
import { extractDocumentText, ParsedDocumentResult } from '@/lib/document/parser';

// Maximum allowed file size: 10 Megabytes
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
// Maximum batch limit per request
const MAX_BATCH_FILES = 50;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Support either multiple files (files) or single file (file)
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const fileList: File[] = [];
    if (files && files.length > 0) {
      fileList.push(...files);
    } else if (singleFile) {
      fileList.push(singleFile);
    }

    if (fileList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided for document parsing.' },
        { status: 400 }
      );
    }

    if (fileList.length > MAX_BATCH_FILES) {
      return NextResponse.json(
        {
          success: false,
          error: `Batch limit exceeded. Maximum ${MAX_BATCH_FILES} files can be processed simultaneously.`,
        },
        { status: 400 }
      );
    }

    // Process files concurrently with isolated error boundaries
    const parsingPromises = fileList.map(async (file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `File "${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
        );
      }

      const buffer = await file.arrayBuffer();
      return extractDocumentText(buffer, file.name, file.type);
    });

    const results = await Promise.allSettled(parsingPromises);

    const documents: ParsedDocumentResult[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    results.forEach((res, index) => {
      const fileName = fileList[index]?.name || `file_${index + 1}`;
      if (res.status === 'fulfilled') {
        documents.push(res.value);
      } else {
        errors.push({
          fileName,
          error: res.reason?.message || 'Failed to extract text from document.',
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalReceived: fileList.length,
      totalParsed: documents.length,
      documents,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error('API /api/parse-document error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while parsing documents.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
