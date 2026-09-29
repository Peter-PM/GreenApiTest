import { useReducer, useState } from "react";
import { useIncomingMessages } from "../hooks/useIncomingMessages";
import { chatsReducer, initialChats } from "../state/chats";
import type { CredentialsI } from "../api/types";
import { ChatView } from "./ChatView";
import { Sidebar } from "./Sidebar";

interface PropsI {
  creds: CredentialsI;
  onLogout: () => void;
}

export function Workspace({ creds, onLogout }: PropsI) {
  const [chats, dispatch] = useReducer(chatsReducer, initialChats);
  const [activeId, setActiveId] = useState<string | null>(null);

  useIncomingMessages(creds, dispatch);

  const activeChat = activeId ? (chats[activeId] ?? null) : null;

  return (
    <div className="app-shell">
      <Sidebar
        creds={creds}
        chats={chats}
        activeId={activeId}
        onSelect={setActiveId}
        onLogout={onLogout}
        dispatch={dispatch}
      />
      {/* key пересоздаёт ChatView при смене чата: черновик относится к тому
          чату, в котором его набирали. */}
      <ChatView
        key={activeId ?? "empty"}
        creds={creds}
        chat={activeChat}
        dispatch={dispatch}
      />
    </div>
  );
}
