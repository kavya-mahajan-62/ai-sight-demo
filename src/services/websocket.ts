const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

export interface WebSocketMessage {
  type: string;
  data: unknown;
}

export interface WebSocketConfig {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnect: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Set<(message: WebSocketMessage) => void> = new Set();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();
  private errorHandlers: Set<(error: Event) => void> = new Set();
  private intentionallyClosed: boolean = false;

  constructor(config: WebSocketConfig = {}) {
    this.url = config.url || `${WS_BASE_URL}/ws`;
    this.reconnect = config.reconnect !== false;
    this.reconnectInterval = config.reconnectInterval || 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;

    if (config.onMessage) {
      this.messageHandlers.add(config.onMessage);
    }
    if (config.onOpen) {
      this.openHandlers.add(config.onOpen);
    }
    if (config.onClose) {
      this.closeHandlers.add(config.onClose);
    }
    if (config.onError) {
      this.errorHandlers.add(config.onError);
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    this.intentionallyClosed = false;

    try {
      console.log(`[WebSocket] Connecting to ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
        this.openHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.closeHandlers.forEach(handler => handler());
        
        if (!this.intentionallyClosed && this.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      if (this.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocket] Disconnected');
  }

  send(message: WebSocketMessage | string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }

    const data = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(data);
  }

  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onOpen(handler: () => void): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  onClose(handler: () => void): () => void {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  onError(handler: (error: Event) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance for app-wide WebSocket connection
let wsInstance: WebSocketClient | null = null;

export const getWebSocketInstance = (config?: WebSocketConfig): WebSocketClient => {
  if (!wsInstance) {
    wsInstance = new WebSocketClient(config);
  }
  return wsInstance;
};

export const disconnectWebSocket = (): void => {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
};
