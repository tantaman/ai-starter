import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useZero } from "./use-zero";

interface ChannelListProps {
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelList({ selectedChannelId, onChannelSelect }: ChannelListProps) {
  const { data: session } = useSession();
  const [channels] = useQuery(queries.channels(session));
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");
  const [channelDescription, setChannelDescription] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const zero = useZero();

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !session) return;

    const id = crypto.randomUUID();
    await zero.mutate.createChannel({
      id,
      name: channelName.trim(),
      description: channelDescription.trim() || undefined,
      isPrivate,
    });

    setChannelName("");
    setChannelDescription("");
    setIsPrivate(false);
    setShowCreateForm(false);
    onChannelSelect(id);
  };

  return (
    <div className="w-64 bg-white border border-black rounded-xl p-4 shadow-[2px_2px_0_#00000020]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Channels</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-yellow text-sm px-2 py-1"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateChannel} className="mb-4 p-3 border border-neutral-200 rounded-lg">
          <input
            type="text"
            placeholder="Channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="input mb-2 text-sm"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            className="input mb-2 text-sm"
            rows={2}
          />
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private channel
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-white text-sm px-2 py-1">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn btn-white text-sm px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
              selectedChannelId === channel.id
                ? "bg-yellow-100 border border-yellow-300"
                : "hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">{channel.isPrivate ? "🔒" : "#"}</span>
              <span className="font-medium">{channel.name}</span>
            </div>
            {channel.description && (
              <div className="text-xs text-neutral-500 mt-1 truncate">
                {channel.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {channels.length === 0 && !showCreateForm && (
        <div className="text-center text-neutral-500 text-sm py-4">
          No channels yet. Create one to get started!
        </div>
      )}
    </div>
  );
}