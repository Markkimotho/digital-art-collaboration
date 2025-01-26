import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Comment {
  id: string
  text: string
  author: string
  timestamp: number
}

interface FeedbackPanelProps {
  comments: Comment[]
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ comments, setComments }) => {
  const [newComment, setNewComment] = useState("")
  const [chatMessage, setChatMessage] = useState("")

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: "Current User", // Replace with actual user name
        timestamp: Date.now(),
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      // Here you would typically send the message to other users via WebSocket
      console.log("Sending chat message:", chatMessage)
      setChatMessage("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Comments</h3>
          <ScrollArea className="h-[200px] mb-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-100 p-2 rounded mb-2">
                <p className="text-sm">{comment.text}</p>
                <p className="text-xs text-gray-500">
                  {comment.author} - {new Date(comment.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </ScrollArea>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="mb-2"
          />
          <Button onClick={addComment} className="w-full">
            Add Comment
          </Button>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2">Chat</h3>
          <ScrollArea className="h-[200px] mb-2">{/* Chat messages would be displayed here */}</ScrollArea>
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            className="mb-2"
          />
          <Button onClick={sendChatMessage} className="w-full">
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedbackPanel

