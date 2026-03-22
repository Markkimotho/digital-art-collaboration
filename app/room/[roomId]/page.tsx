import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CanvasRoom from '@/components/CanvasRoom'

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      layers: { orderBy: { order: 'asc' } },
      versions: { orderBy: { createdAt: 'desc' }, take: 20 },
      chatMessages: { orderBy: { createdAt: 'asc' }, take: 50 },
    },
  })

  if (!room) {
    redirect('/')
  }

  return (
    <CanvasRoom
      roomId={roomId}
      initialCanvasState={room.canvasState}
      initialLayers={room.layers}
      initialVersions={room.versions.map((v) => ({
        id: v.id,
        label: v.label,
        createdAt: v.createdAt.toISOString(),
        roomId: v.roomId,
      }))}
      initialChat={room.chatMessages.map((m) => ({
        id: m.id,
        author: m.author,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  )
}
