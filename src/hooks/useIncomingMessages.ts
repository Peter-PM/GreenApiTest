import { useEffect, type Dispatch } from "react";
import { deleteNotification, receiveNotification } from "../api/greenApi";
import type { CredentialsI } from "../api/types";
import { actionFromNotification, type ChatsAction } from "../state/chats";
import { describeError } from "../utils";

const POLL_TIMEOUT = 20;
const ERROR_BACKOFF = 5000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useIncomingMessages(
  creds: CredentialsI | null,
  dispatch: Dispatch<ChatsAction>,
): void {
  useEffect(() => {
    if (!creds) return;

    let cancelled = false;
    let lastError = "";
    const controller = new AbortController();

    const loop = async () => {
      while (!cancelled) {
        try {
          const response = await receiveNotification(
            creds,
            POLL_TIMEOUT,
            controller.signal,
          );
          if (cancelled) return;

          if (response) {
            const action = actionFromNotification(response.body);
            if (action) dispatch(action);
            try {
              await deleteNotification(creds, response.receiptId);
            } catch (err) {
              console.error(
                "[incoming] не удалось подтвердить уведомление",
                err,
              );
            }
          }
          lastError = "";
        } catch (err) {
          // Отмена не отличима от сбоя: обрывает fetch, а request оборачивает
          // это в обычное исключение. Но `cancelled` к этому моменту уже
          // true — abort() вызывается в той же cleanup, что и этот флаг, —
          // поэтому ложный «недоступна сеть» на выходе не печатается.
          if (cancelled) return;
          const message = describeError(err);
          if (message !== lastError) {
            lastError = message;
            console.error("[incoming]", err);
          }
          await delay(ERROR_BACKOFF);
        }
      }
    };

    void loop();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [creds, dispatch]);
}
