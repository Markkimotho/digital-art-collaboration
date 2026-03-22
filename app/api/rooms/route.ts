import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = body.name || 'Untitled Canvas'

    const room = await prisma.room.create({
      data: { name },
    })

    // Create a default layer
    await prisma.layer.create({
      data: {
        id: crypto.randomUUID(),
        roomId: room.id,
        name: 'Layer 1',
        locked: false,
        visible: true,
        order: 0,
      },
    })

    return NextResponse.json({ roomId: room.id, name: room.name })
  } catch (err) {
    console.error('Error creating room:', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    })
    return NextResponse.json({ rooms })
  } catch (err) {
    console.error('Error listing rooms:', err)
    return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 })
  }
}
