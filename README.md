# Digital Art Collaboration

A real-time collaborative canvas application for creating digital art together. Built with Next.js 15, Socket.io, Prisma, and react-konva.

## Features

- **Real-time Collaboration**: Multiple users can draw and edit on the same canvas simultaneously using WebSockets
- **Drawing Tools**: Freehand strokes, shapes, and text elements
- **Layer Management**: Organized layer system with lock and visibility controls
- **Version Control**: Save and revert to previous canvas states
- **Live Chat**: In-room messaging for collaboration
- **Cursor Tracking**: See other users' cursor positions in real-time
- **Infinite Canvas**: Pan and zoom support with react-konva

## Tech Stack

- **Frontend**: Next.js 15, React 19, react-konva, Radix UI
- **Real-time Communication**: Socket.io with WebSocket and polling support
- **Backend**: Node.js (custom HTTP server with Socket.io integration)
- **Database**: SQLite with Prisma 7 ORM
- **Styling**: Tailwind CSS with Framer Motion animations
- **Drawing**: Konva.js canvas library

## Getting Started

### Prerequisites

- Node.js 18+ with npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd digital-art-collaboration

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### Running the Application

```bash
# Development mode
npm run dev
```

The application will start at `http://localhost:3000`

**Important**: Do not use `next dev`. The application requires the custom `server.ts` which handles Socket.io integration.

### Database Management

```bash
# Run database migrations
npm run db:migrate

# Open Prisma Studio for database inspection
npm run db:studio
```

### Building for Production

```bash
# Build the application
npm build

# Start the production server
npm start
```

## Project Structure

```
digital-art-collaboration/
├── app/
│   ├── api/                    # API routes for room management
│   ├── room/[roomId]/          # Room collaboration page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page / room lobby
│   └── globals.css             # Global styles
├── components/
│   ├── CanvasRoom.tsx         # Main collaborative canvas
│   ├── RoomLobby.tsx          # Room selection/creation
│   ├── LayerPanel.tsx         # Layer management UI
│   ├── ToolBar.tsx            # Drawing tools UI
│   ├── VersionControl.tsx     # Version history UI
│   └── ...                    # Other UI components
├── lib/
│   └── prisma.ts              # Prisma client setup
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── dev.db                 # SQLite database file
├── types/
│   └── canvas.ts              # TypeScript type definitions
├── server.ts                  # Custom HTTP server with Socket.io
└── package.json
```

## Architecture Overview

### Custom Server

The application uses a custom `server.ts` instead of Next.js's default dev server to integrate Socket.io for real-time communication. This server:

- Handles Next.js request routing
- Manages Socket.io connections
- Broadcasts drawing events in real-time
- Persists canvas state to the database

### Database Schema

**Room**: Collaboration space
- `id`: Unique room identifier
- `name`: Room name
- `canvasState`: JSON representation of all canvas elements
- `layers`: Associated layers
- `versions`: Saved version history
- `chatMessages`: Room chat messages

**Layer**: Drawing layers within a room
- `id`: Layer identifier
- `name`: Display name
- `visible`: Toggle visibility
- `locked`: Prevent edits when locked
- `order`: Z-index ordering

**Version**: Canvas state snapshots
- `label`: Version description
- `canvasState`: Complete canvas state at time of save
- `createdAt`: Timestamp

**ChatMessage**: In-room messages
- `author`: User name
- `text`: Message content
- `createdAt`: Timestamp

### Socket.io Events

**Room Management**
- `room:join` - Join a collaboration room
- `room:state` - Receive initial room state
- `room:user-joined` - User joined the room
- `room:user-left` - User left the room
- `room:user-count` - Current user count

**Drawing**
- `draw:stroke-start` - Begin drawing a stroke
- `draw:stroke-update` - Update stroke in progress
- `draw:stroke-end` - Complete and persist stroke
- `draw:shape-add` - Add a shape element
- `draw:text-add` - Add a text element
- `draw:element-move` - Move an element
- `draw:clear` - Clear canvas or specific layer

**Layers**
- `layer:add` - Create a new layer
- `layer:update` - Modify layer properties
- `layer:delete` - Remove a layer
- `layer:updated` - Receive updated layer list

**Versions**
- `version:save` - Create a version snapshot
- `version:revert` - Restore from a previous version
- `version:reverted` - Receive canvas restoration

**Chat**
- `chat:send` - Send a message
- `chat:message` - Receive a message

**Cursors**
- `cursor:move` - Broadcast cursor position
- `cursor:positions` - Receive other users' cursor positions

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
