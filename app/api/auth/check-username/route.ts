import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        return NextResponse.json({ available: !existingUser });

    } catch (error) {
        console.error('Username check error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
