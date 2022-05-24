const url = 'ws://localhost:8080';

module.exports = class WebSocketClient {
  constructor(onMessage, OnOpen, OnClose, OnError) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = onMessage;
    this.ws.onopen = OnOpen;
    this.ws.onclose = OnClose;
    this.ws.onerror = OnError;
  }

  sendMessage(message) {
    this.ws.send(message);
  }
}