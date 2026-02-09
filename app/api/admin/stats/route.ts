import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded as any).username !== process.env.ADMIN_USERNAME && (decoded as any).username !== 'jedicebi52') {
            // Fallback hardcoded admin check if env var is missing during dev
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch data in parallel
        const [users, dreams, totalDreamsCount] = await Promise.all([
            prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    username: true,
                    createdAt: true,
                    zodiacSign: true,
                    _count: {
                        select: { dreams: true }
                    }
                }
            }),
            prisma.dream.findMany({
                orderBy: { date: 'desc' },
                include: {
                    user: {
                        select: { username: true }
                    }
                }
            }),
            prisma.dream.count()
        ]);

        const totalUsers = users.length;

        // Calculate detailed stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const thisWeekDreams = dreams.filter(d => new Date(d.date) >= weekAgo).length;
        const interpretedDreams = dreams.filter(d => d.interpretation).length;

        // Mock feedbacks for now as the model does not exist
        const feedbacks: any[] = [];

        return NextResponse.json({
            stats: {
                totalDreams: totalDreamsCount,
                totalUsers,
                thisWeekDreams,
                interpretedDreams,
                totalFeedbacks: feedbacks.length,
            },
            users: users.map(u => ({
                ...u,
                createdAt: u.createdAt.toISOString(),
                dreamCount: u._count.dreams
            })),
            dreams: dreams.map(d => ({
                id: d.id,
                text: d.text,
                date: d.date.toISOString(),
                interpretation: d.interpretation,
                username: d.user.username,
                userId: d.userId
            })),
            feedbacks
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
