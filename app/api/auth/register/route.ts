import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, password, zodiacSign } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                zodiacSign,
            },
        });

        const token = signToken({ userId: user.id, username: user.username, zodiacSign: user.zodiacSign });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username, zodiacSign: user.zodiacSign }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
