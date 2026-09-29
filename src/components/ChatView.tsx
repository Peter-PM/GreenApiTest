import type { Dispatch } from "react";
import type { CredentialsI } from "../api/types";
import type { ChatI, ChatsAction } from "../state/chats";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

interface PropsI {
  creds: CredentialsI;
  chat: ChatI | null;
  dispatch: Dispatch<ChatsAction>;
}

export function ChatView({ creds, chat, dispatch }: PropsI) {
  if (!chat) {
    return (
      <section className="chat empty-chat">
        <div className="empty-chat-inner">
          <div className="brand-mark big" aria-hidden="true" />
          <p>Выберите чат или создайте новый</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat">
      <header className="chat-head">
        <h2>{chat.title}</h2>
        {chat.phone && <span className="chat-phone">{chat.phone}</span>}
      </header>

      <MessageList messages={chat.messages} />

      <Composer creds={creds} chatId={chat.chatId} dispatch={dispatch} />
    </section>
  );
}
