import {
  OUTGOING_STATUSES,
  type MessageI,
  type NotificationBodyI,
  type OutgoingStatus,
} from "../api/types";

export interface ChatI {
  chatId: string;
  title: string;
  phone: string;
  messages: MessageI[];
}

export type ChatsAction =
  | { type: "chatOpened"; chatId: string; title: string; phone: string }
  | {
      type: "messageReceived";
      chatId: string;
      title: string;
      message: MessageI;
    }
  | { type: "messageSent"; chatId: string; message: MessageI }
  // Без chatId: ищем чат по самому сообщению, idMessage уникален.
  | { type: "statusChanged"; messageId: string; status: OutgoingStatus };

export const initialChats: Record<string, ChatI> = {};

// Если переход ничего не изменил, возвращаем тот же объект — иначе
// перерисовывается список чатов.
export function chatsReducer(
  state: Record<string, ChatI>,
  action: ChatsAction,
): Record<string, ChatI> {
  switch (action.type) {
    case "chatOpened": {
      const chat = state[action.chatId];
      if (!chat) {
        return {
          ...state,
          [action.chatId]: {
            chatId: action.chatId,
            title: action.title,
            phone: action.phone,
            messages: [],
          },
        };
      }
      // Чат мог прийти входящим раньше, чем его открыли по номеру.
      if (chat.phone === action.phone) return state;
      return { ...state, [action.chatId]: { ...chat, phone: action.phone } };
    }

    case "messageReceived": {
      const chat = state[action.chatId];
      if (!chat) {
        return {
          ...state,
          [action.chatId]: {
            chatId: action.chatId,
            title: action.title,
            phone: "",
            messages: [action.message],
          },
        };
      }
      // Дубль приходит, если deleteNotification не прошёл, — а показать
      // одно сообщение дважды нельзя.
      if (chat.messages.some((m) => m.id === action.message.id)) return state;
      return {
        ...state,
        [action.chatId]: {
          ...chat,
          messages: [...chat.messages, action.message],
        },
      };
    }

    case "messageSent": {
      const chat = state[action.chatId];
      // Сообщение могли отправить до того, как чат открыли: заголовком
      // временно становится сам chatId.
      if (!chat) {
        return {
          ...state,
          [action.chatId]: {
            chatId: action.chatId,
            title: action.chatId,
            phone: "",
            messages: [action.message],
          },
        };
      }
      return {
        ...state,
        [action.chatId]: {
          ...chat,
          messages: [...chat.messages, action.message],
        },
      };
    }

    case "statusChanged": {
      // Ищем чат по самому сообщению, а не по chatId из уведомления: в
      // разных уведомлениях идентификатор приходит по-разному (верхний
      // уровень против senderData), и при несовпадении форматов обновление
      // молча пропадало бы.
      let changed = false;
      const next: Record<string, ChatI> = {};
      for (const [key, chat] of Object.entries(state)) {
        let hit = false;
        const messages = chat.messages.map((message) => {
          if (message.id !== action.messageId) return message;
          hit = true;
          return { ...message, status: action.status };
        });
        if (hit) {
          changed = true;
          next[key] = { ...chat, messages };
        } else {
          next[key] = chat;
        }
      }
      if (!changed) return state;
      return next;
    }
  }
}

// Всё, что приложение не умеет рисовать, и все неизвестные `typeWebhook`
// отбрасываются здесь. Возвращает null, если показывать нечего.
export function actionFromNotification(
  body: NotificationBodyI,
): ChatsAction | null {
  // Статус разбираем первым и по typeWebhook: в этом теле нет ни senderData,
  // ни messageData, и общий разбор ниже отбросил бы его сразу.
  if (body.typeWebhook === "outgoingMessageStatus") {
    const raw = body.status;
    if (!raw) return null;
    // Сверяем со списком, а не верим строке: значение не из списка дало бы
    // пустую подпись в пузыре.
    const status = OUTGOING_STATUSES.find((one) => one === raw);
    if (!status) {
      console.error("[incoming] неизвестный статус исходящего:", raw);
      return null;
    }
    return { type: "statusChanged", messageId: body.idMessage, status };
  }

  if (body.typeWebhook !== "incomingMessageReceived") return null;

  const sender = body.senderData;
  const chatId = sender?.chatId;
  if (!chatId) return null;

  const text = body.messageData?.textMessageData?.textMessage;
  if (body.messageData?.typeMessage !== "textMessage" || !text) return null;

  const title =
    sender.chatName ||
    sender.senderContactName ||
    sender.senderName ||
    (sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : chatId);

  return {
    type: "messageReceived",
    chatId,
    title,
    message: {
      id: body.idMessage,
      direction: "in",
      text,
      timestamp: body.timestamp,
      status: "sent",
    },
  };
}
