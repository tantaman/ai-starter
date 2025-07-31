import { useState, useRef, KeyboardEvent } from "react";
import { useSession } from "@/client/auth";
import { useZero } from "./use-zero";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const zero = useZero();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await zero.mutate.sendMessage({
        id: crypto.randomUUID(),
        content: message.trim(),
        channelId,
      });
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  if (!session) {
    return (
      <div className="p-4 border-t border-neutral-200 text-center text-neutral-500">
        Please log in to send messages
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-neutral-200">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="w-full resize-none border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent text-sm"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isSubmitting}
          className="btn btn-yellow px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "..." : "Send"}
        </button>
      </form>
      
      <div className="text-xs text-neutral-400 mt-1">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}