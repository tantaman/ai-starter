import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { ChannelList } from "./channel-list";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

export function Chat() {
  const { data: session } = useSession();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [allChannels] = useQuery(queries.channels(session));
  const channel = selectedChannelId ? allChannels.find(c => c.id === selectedChannelId) : null;

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Welcome to Chat</h2>
          <p className="text-neutral-600 mb-4">
            Please log in to access the chat application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="flex-shrink-0 p-4">
        <ChannelList
          selectedChannelId={selectedChannelId || undefined}
          onChannelSelect={setSelectedChannelId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannelId && channel ? (
          <>
            {/* Channel Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center">
                <span className="text-lg mr-3">
                  {channel.isPrivate ? "🔒" : "#"}
                </span>
                <div>
                  <h1 className="text-xl font-bold">{channel.name}</h1>
                  {channel.description && (
                    <p className="text-sm text-neutral-600">{channel.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col bg-white">
              <MessageList channelId={selectedChannelId} />
              <MessageInput channelId={selectedChannelId} />
            </div>
          </>
        ) : (
          /* No Channel Selected */
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">Select a channel</h2>
              <p className="text-neutral-600">
                Choose a channel from the sidebar to start chatting, or create a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}