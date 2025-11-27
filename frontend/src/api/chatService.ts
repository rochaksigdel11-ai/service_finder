// src/services/chatService.ts
class ChatService {
  private socket: WebSocket | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];

  connect(userId: number) {
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${userId}/`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageCallbacks.forEach(callback => callback(message));
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();