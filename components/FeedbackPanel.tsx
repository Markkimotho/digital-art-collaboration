'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '@/types/canvas'

interface FeedbackPanelProps {
  chat: ChatMessage[]
  onSendMessage: (text: string) => void
  userName: string
}

function timeStamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FeedbackPanel({ chat, onSendMessage, userName }: FeedbackPanelProps) {
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat])

  const handleSend = () => {
    const text = message.trim()
    if (!text) return
    onSendMessage(text)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Chat</span>
        <span className="text-xs text-white/25">{chat.length} messages</span>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[200px] max-h-[360px] overflow-y-auto scrollbar-thin flex flex-col gap-2 pr-1"
      >
        <AnimatePresence initial={false}>
          {chat.map((msg) => {
            const isOwn = msg.author === userName
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {!isOwn && (
                  <span className="text-xs text-white/35 mb-0.5 px-1">{msg.author}</span>
                )}
                <div
                  className={`
                    max-w-[85%] px-3 py-2 rounded-2xl text-sm
                    ${isOwn
                      ? 'bg-primary/25 text-white/90 rounded-br-sm'
                      : 'bg-white/8 text-white/75 rounded-bl-sm'
                    }
                  `}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-white/25 mt-0.5 px-1">{timeStamp(msg.createdAt)}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {chat.length === 0 && (
          <div className="text-center py-8 text-white/25 text-sm">
            Start the conversation
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 mt-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="
            flex-1 resize-none px-3 py-2 rounded-xl text-sm
            border border-white/8 outline-none
            focus:border-white/20 transition-colors
            max-h-24 scrollbar-thin
          "
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(220, 210, 185, 0.88)',
            caretColor: 'rgba(220, 210, 185, 0.88)',
            ...(({ fieldSizing: 'content' } as React.CSSProperties)),
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!message.trim()}
          className="
            p-2.5 rounded-xl bg-primary/20 hover:bg-primary/35 border border-primary/30
            text-primary transition-colors disabled:opacity-40 flex-shrink-0
          "
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  )
}
