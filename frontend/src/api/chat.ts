import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const getChatConversations = async () => {
  const res = await axios.get(`${API_BASE}/chat/conversations/`);
  return res.data;
};

export const getChatMessages = async (convoId: number) => {
  const res = await axios.get(`${API_BASE}/chat/messages/${convoId}/`);
  return res.data;
};

export const sendMessage = async (convoId: number, message: string) => {
  const res = await axios.post(`${API_BASE}/chat/messages/${convoId}/`, { text: message });
  return res.data;
};