import type { Dispatch } from "react";
import type { CredentialsI } from "../api/types";
import type { ChatI, ChatsAction } from "../state/chats";
import { ChatList } from "./ChatList";
import { NewChatForm } from "./NewChatForm";

interface PropsI {
  creds: CredentialsI;
  chats: Record<string, ChatI>;
  activeId: string | null;
  onSelect: (chatId: string) => void;
  onLogout: () => void;
  dispatch: Dispatch<ChatsAction>;
}

export function Sidebar({
  creds,
  chats,
  activeId,
  onSelect,
  onLogout,
  dispatch,
}: PropsI) {
  return (
    <aside className="sidebar">
      <header className="sidebar-head">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>MAX</span>
        </div>
        <button type="button" className="ghost" onClick={onLogout} title="Выйти">
          Выйти
        </button>
      </header>

      <NewChatForm
        creds={creds}
        onCreated={onSelect}
        dispatch={dispatch}
      />

      <ChatList chats={chats} activeId={activeId} onSelect={onSelect} />
    </aside>
  );
}
