// Формы перенесены из документации GREEN-API для мессенджера MAX:
// https://green-api.com/v3/docs/api/ — добавляя метод, бери таблицу оттуда,
// а не по соседнему методу.

export interface CredentialsI {
  idInstance: string;
  apiTokenInstance: string;
}

export const MESSAGE_MAX_LENGTH = 4000;

export interface CheckAccountRequestI {
  phoneNumber: number;
  force?: boolean;
}

export interface CheckAccountResponseI {
  exist?: boolean;
  chatId?: string;
  fromCache?: boolean;
  status?: boolean;
  reason?: string;
}

export interface CheckAccountResultI {
  chatId: string;
}

export interface SendMessageRequestI {
  chatId: string;
  message: string;
}

export interface SendMessageResponseI {
  idMessage: string;
}

export const OUTGOING_STATUSES = [
  "sent",
  "delivered",
  "read",
  "failed",
] as const;

export type OutgoingStatus = (typeof OUTGOING_STATUSES)[number];

export interface ChatHistoryEntryI {
  type: "incoming" | "outgoing";
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  statusMessage?: OutgoingStatus;
}

export interface NotificationResponseI {
  receiptId: number;
  body: NotificationBodyI;
}

// **Тело у разных `typeWebhook` разное.** У `incomingMessageReceived` есть
// `senderData` и `messageData`, а у `outgoingMessageStatus` их нет вовсе:
// ни отправителя, ни текста — только `status` и `chatId` верхнего уровня.
// Поэтому оба блока необязательные, и тело приходится разбирать по
// `typeWebhook`, а не по наличию полей.
export interface NotificationBodyI {
  typeWebhook: string;
  timestamp: number;
  idMessage: string;
  // Идентификатор чата верхнего уровня. Есть в outgoingMessageStatus.
  chatId?: string;
  // Статус исходящего сообщения. Есть только в outgoingMessageStatus.
  status?: string;
  senderData?: {
    chatId: string;
    chatName?: string;
    chatType?: string;
    sender: string;
    senderName?: string;
    senderContactName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: { textMessage: string };
  };
}

export interface MessageI {
  id: string;
  direction: "in" | "out";
  text: string;
  // Секунды Unix, как их отдаёт GREEN-API.
  timestamp: number;
  // `queued` — начальное состояние: 200 от SendMessage означает лишь, что
  // сообщение встало в очередь отправки, а не что доставлено.
  status: OutgoingStatus | "queued";
}
