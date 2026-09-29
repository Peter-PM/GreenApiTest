import {
  type CheckAccountRequestI,
  type CheckAccountResponseI,
  type CheckAccountResultI,
  type CredentialsI,
  type NotificationResponseI,
  type SendMessageRequestI,
  type SendMessageResponseI,
} from "./types";

const API_HOST = "https://3100.api.green-api.com";

function endpoint(creds: CredentialsI, method: string): string {
  const { idInstance, apiTokenInstance } = creds;
  return `${API_HOST}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
}

// Текст сбоя достаём из тела: GREEN-API кладёт его в `message` или `reason`.
function errorText(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["message", "reason"]) {
      if (typeof record[key] === "string") return record[key];
    }
  }
  return `HTTP ${status}`;
}

interface RequestOptionsI {
  body?: unknown;
  signal?: AbortSignal;
}

// `Content-Type` ставим только когда есть тело: без него запрос остаётся
// «простым» и не требует preflight, а preflight на каждом опросе очереди —
// это лишний круг до шлюза.
async function request<T>(
  url: string,
  method: "POST" | "GET" | "DELETE",
  options: RequestOptionsI = {},
): Promise<T> {
  const { body, signal } = options;
  const hasBody = body !== undefined;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (cause) {
    throw new Error("Сеть недоступна или запрос заблокирован CORS", { cause });
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) throw new Error(errorText(res.status, parsed));
  return parsed as T;
}

// Часть сбоев приходит кодом 200 с телом `{status: false, reason}`.
export async function checkAccount(
  creds: CredentialsI,
  digits: string,
): Promise<CheckAccountResultI> {
  const url = endpoint(creds, "checkAccount");
  const result = await request<CheckAccountResponseI>(url, "POST", {
    body: { phoneNumber: Number(digits) } as CheckAccountRequestI,
  });

  if (result.exist !== true || !result.chatId) {
    throw new Error(result.reason ?? "Аккаунт MAX с таким номером не найден");
  }
  return { chatId: result.chatId };
}

export function sendMessage(creds: CredentialsI, body: SendMessageRequestI) {
  const url = endpoint(creds, "sendMessage");
  return request<SendMessageResponseI>(url, "POST", { body });
}

export function receiveNotification(
  creds: CredentialsI,
  receiveTimeout: number,
  signal?: AbortSignal,
): Promise<NotificationResponseI | null> {
  const url = `${endpoint(creds, "receiveNotification")}?receiveTimeout=${receiveTimeout}`;
  return request<NotificationResponseI | null>(url, "GET", { signal });
}

export function deleteNotification(creds: CredentialsI, receiptId: number) {
  const url = `${endpoint(creds, "deleteNotification")}/${receiptId}`;
  return request<{ result: boolean; reason: string }>(url, "DELETE");
}
