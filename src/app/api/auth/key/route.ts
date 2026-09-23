import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'fitlens_session_key';

// Helper to mask an API key for safe client display
function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  const prefix = key.slice(0, 3);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * GET /api/auth/key
 * Returns safe authentication status without ever exposing the raw secret.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieKey = cookieStore.get(COOKIE_NAME)?.value;
    const envKey = process.env.TYPESAFE_API_KEY;

    if (cookieKey && cookieKey.trim()) {
      return NextResponse.json({
        isConfigured: true,
        source: 'session',
        maskedKey: maskApiKey(cookieKey.trim()),
      });
    }

    if (envKey && envKey.trim()) {
      return NextResponse.json({
        isConfigured: true,
        source: 'env',
        maskedKey: maskApiKey(envKey.trim()),
      });
    }

    return NextResponse.json({
      isConfigured: false,
      source: 'none',
    });
  } catch (error: unknown) {
    console.error('Error fetching key status:', error);
    return NextResponse.json(
      { isConfigured: false, source: 'none', error: 'Failed to inspect credentials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/key
 * Stores user-supplied API key securely in an HttpOnly session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required.' },
        { status: 400 }
      );
    }

    // Basic format validation
    if (apiKey.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key format.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: apiKey,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      source: 'session',
      maskedKey: maskApiKey(apiKey),
    });
  } catch (error: unknown) {
    console.error('Error saving session key:', error);
    const message = error instanceof Error ? error.message : 'Failed to save session key';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/key
 * Revokes the session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    // Check if env key is available as fallback
    const envKey = process.env.TYPESAFE_API_KEY;
    const hasEnv = !!(envKey && envKey.trim());

    return NextResponse.json({
      success: true,
      isConfigured: hasEnv,
      source: hasEnv ? 'env' : 'none',
      maskedKey: hasEnv ? maskApiKey(envKey!.trim()) : undefined,
    });
  } catch (error: unknown) {
    console.error('Error revoking session key:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear key' }, { status: 500 });
  }
}
