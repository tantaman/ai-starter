import { useEffect, useRef } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useZero } from "./use-zero";

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const { data: session } = useSession();
  const [messages] = useQuery(queries.messages(session, channelId));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const zero = useZero();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await zero.mutate.deleteMessage({ id: messageId });
    }
  };

  const formatTime = (date: number) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const formatDate = (date: number) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  let lastDate: string | null = null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="text-center text-neutral-500 py-8">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message, index) => {
          const messageDate = formatDate(message.createdAt);
          const showDateSeparator = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-neutral-200"></div>
                  <span className="px-3 text-xs text-neutral-500 bg-white">
                    {messageDate}
                  </span>
                  <div className="flex-1 border-t border-neutral-200"></div>
                </div>
              )}

              <div className="group flex items-start space-x-3 hover:bg-neutral-50 px-2 py-1 rounded-lg">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-bold">
                  {message.author?.name[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm">
                      {message.author?.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm text-neutral-900 mt-1 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>

                {session?.user.id === message.authorId && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 text-xs px-2 py-1 rounded transition-all"
                    title="Delete message"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
