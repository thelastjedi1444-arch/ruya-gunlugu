import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { dreams } = await req.json();

        if (!Array.isArray(dreams)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const createdDreams = [];

        for (const d of dreams) {
            // Basic check to avoid duplicates if needed, or just insert
            // For simplicity, we'll insert. In a real app, maybe check by date/content
            const newDream = await prisma.dream.create({
                data: {
                    text: d.text,
                    title: d.title,
                    interpretation: d.interpretation,
                    date: new Date(d.date),
                    userId: session.userId
                }
            });
            createdDreams.push(newDream);
        }

        return NextResponse.json({ success: true, count: createdDreams.length });
    } catch (error) {
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
