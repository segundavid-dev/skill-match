import api from './axios';
import type {
    ChatRoom,
    Message,
    SendMessagePayload,
    ApiResponse,
} from '../types';

export const chatApi = {
    /** Get all chat rooms for the current user */
    getMyChats: () =>
        api.get<ApiResponse<ChatRoom[]>>('/chats'),

    /** Get messages in a specific chat room */
    getMessages: (roomId: string) =>
        api.get<ApiResponse<Message[]>>(`/chats/${roomId}/messages`),

    /** Send a message to a chat room */
    sendMessage: (roomId: string, payload: SendMessagePayload) =>
        api.post<ApiResponse<Message>>(`/chats/${roomId}/messages`, payload),

    /** Get a single chat room with participants and match info */
    getRoom: (roomId: string) =>
        api.get<ApiResponse<ChatRoom>>(`/chats/${roomId}`),
};
