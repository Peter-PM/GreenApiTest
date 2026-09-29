import { useState, type Dispatch } from "react";
import { sendMessage } from "../api/greenApi";
import { MESSAGE_MAX_LENGTH, type CredentialsI } from "../api/types";
import type { ChatsAction } from "../state/chats";
import { useAsync } from "../hooks/useAsync";
import { nowSeconds } from "../utils";

interface PropsI {
  creds: CredentialsI;
  chatId: string;
  dispatch: Dispatch<ChatsAction>;
}

export function Composer({ creds, chatId, dispatch }: PropsI) {
  const [draft, setDraft] = useState("");
  const { run, pending } = useAsync();

  const tooLong = draft.length > MESSAGE_MAX_LENGTH;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text === "" || tooLong || pending) return;

    const result = await run(() =>
      sendMessage(creds, { chatId, message: text }),
    );
    if (!result) return;

    setDraft("");
    dispatch({
      type: "messageSent",
      chatId,
      message: {
        id: result.idMessage,
        direction: "out",
        text,
        timestamp: nowSeconds(),
        status: "queued",
      },
    });
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit(e);
          }
        }}
        placeholder="Напишите сообщение…"
        rows={1}
        maxLength={MESSAGE_MAX_LENGTH}
      />
      <button
        type="submit"
        className="primary send"
        disabled={draft.trim() === "" || tooLong || pending}
        aria-label="Отправить"
      >
        ➤
      </button>
    </form>
  );
}
