import { useState, type Dispatch } from "react";
import { checkAccount } from "../api/greenApi";
import type { CredentialsI } from "../api/types";
import type { ChatsAction } from "../state/chats";
import { useAsync } from "../hooks/useAsync";

interface PropsI {
  creds: CredentialsI;
  onCreated: (chatId: string) => void;
  dispatch: Dispatch<ChatsAction>;
}

const PHONE_MIN_DIGITS = 11;
const PHONE_MAX_DIGITS = 12;
const PHONE_HINT = `${PHONE_MIN_DIGITS}–${PHONE_MAX_DIGITS} цифр, код 7 или 375`;

function digitsOf(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function NewChatForm({ creds, onCreated, dispatch }: PropsI) {
  const [composing, setComposing] = useState(false);
  const [phone, setPhone] = useState("");
  const { run, pending } = useAsync();

  if (!composing) {
    return (
      <div className="new-chat">
        <button
          type="button"
          className="new-chat-btn"
          onClick={() => setComposing(true)}
        >
          <span aria-hidden="true">+</span> Новый чат
        </button>
      </div>
    );
  }

  const digits = digitsOf(phone);
  const phoneOk =
    digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!phoneOk) return;
    setComposing(false);
    setPhone("");

    const result = await run(() => checkAccount(creds, digits));
    if (!result) return;

    const { chatId } = result;
    dispatch({
      type: "chatOpened",
      chatId,
      title: digits,
      phone: digits,
    });
    onCreated(chatId);
  }

  return (
    <div className="new-chat">
      <form onSubmit={submit}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона"
          inputMode="numeric"
          autoFocus
        />
        <div className="new-chat-actions">
          <button
            type="submit"
            className="primary"
            disabled={!phoneOk || pending}
          >
            {pending ? "Проверка…" : "Создать"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setComposing(false);
              setPhone("");
            }}
          >
            Отмена
          </button>
        </div>
        <p className="hint">{PHONE_HINT}</p>
      </form>
    </div>
  );
}
