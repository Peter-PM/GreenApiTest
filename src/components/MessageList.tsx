import { useEffect, useRef } from "react";
import { formatClockTime } from "../utils";
import type { MessageI } from "../api/types";

interface PropsI {
  messages: MessageI[];
}

const STATUS_LABEL: Record<MessageI["status"], string> = {
  queued: "в очереди",
  sent: "отправлено",
  delivered: "доставлено",
  read: "прочитано",
  failed: "ошибка",
};

export function MessageList({ messages }: PropsI) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  return (
    <div className="messages" ref={scrollRef}>
      {messages.length === 0 && (
        <p className="no-messages">Сообщений пока нет. Напишите первым.</p>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={message.direction === "out" ? "bubble out" : "bubble in"}
        >
          <p className="bubble-text">{message.text}</p>
          <span className="bubble-meta">
            {formatClockTime(message.timestamp)}
            {message.direction === "out" && (
              <span className={message.status === "failed" ? "status bad" : "status"}>
                {" "}
                {STATUS_LABEL[message.status]}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
