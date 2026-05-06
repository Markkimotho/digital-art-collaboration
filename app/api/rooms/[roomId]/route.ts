import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params
    await prisma.room.delete({ where: { id: roomId } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error deleting room:', err)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
