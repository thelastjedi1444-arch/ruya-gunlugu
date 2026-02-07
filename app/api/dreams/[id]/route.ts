import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { interpretation, title } = await request.json(); // Allow updating title/interpretation

        // Verify ownership
        const dream = await prisma.dream.findUnique({
            where: { id },
        });

        if (!dream || dream.userId !== session.userId) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        const updatedDream = await prisma.dream.update({
            where: { id },
            data: {
                interpretation,
                title,
            },
        });

        return NextResponse.json({
            ...updatedDream,
            date: updatedDream.date.toISOString()
        });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
