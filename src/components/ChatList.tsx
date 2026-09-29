import type { ChatI } from "../state/chats";
import { formatListTime } from "../utils";

interface PropsI {
  chats: Record<string, ChatI>;
  activeId: string | null;
  onSelect: (chatId: string) => void;
}

// сортируем список по времени последнего сообщения.
function lastActivity(chat: ChatI): number {
  return chat.messages.length > 0
    ? chat.messages[chat.messages.length - 1]!.timestamp
    : 0;
}

export function ChatList({ chats, activeId, onSelect }: PropsI) {
  const sorted = Object.values(chats).sort(
    (a, b) => lastActivity(b) - lastActivity(a),
  );

  if (sorted.length === 0) {
    return (
      <ul className="chat-list">
        <li className="empty">
          Чатов пока нет.
          <br />
          Создайте чат по номеру телефона —
          <br />
          или дождитесь входящего сообщения.
        </li>
      </ul>
    );
  }

  return (
    <ul className="chat-list">
      {sorted.map((chat) => {
        const last = chat.messages[chat.messages.length - 1];
        const title = chat.title;
        return (
          <li key={chat.chatId}>
            <button
              type="button"
              className={
                chat.chatId === activeId ? "chat-item active" : "chat-item"
              }
              onClick={() => onSelect(chat.chatId)}
            >
              <span className="avatar" aria-hidden="true">
                {title.slice(0, 1).toUpperCase()}
              </span>
              <span className="chat-item-body">
                <span className="chat-item-top">
                  <span className="chat-title">{title}</span>
                  <span className="chat-time">
                    {formatListTime(last?.timestamp ?? 0)}
                  </span>
                </span>
                <span className="chat-preview">
                  {last?.text || "Нет сообщений"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
