import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const dreams = await prisma.dream.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' },
        });

        // Format dates to ISO strings if needed, though Prisma Date objects are fine
        // But our frontend expects ISO strings in Dream interface
        const formattedDreams = dreams.map((d: any) => ({
            ...d,
            date: d.date.toISOString(),
        }));

        return NextResponse.json(formattedDreams);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { text, title, interpretation, date } = await req.json();

        const dream = await prisma.dream.create({
            data: {
                text,
                title,
                interpretation,
                date: date ? new Date(date) : undefined,
                userId: session.userId,
            },
        });

        return NextResponse.json({
            ...dream,
            date: dream.date.toISOString()
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create dream' }, { status: 500 });
    }
}
