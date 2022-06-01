const url = 'ws://localhost:8080';
const WebSocket = require('ws');

module.exports = class WebSocketClient {
  constructor() {
    this.ws = null;
  }

  configureWebSocket(onMessage, OnOpen, OnClose, OnError, strategyObj) {
    this.ws = new WebSocket(url);
    this.ws.strategyObj = strategyObj;
    this.ws.onmessage = onMessage;
    this.ws.onopen = OnOpen;
    this.ws.onclose = OnClose;
    this.ws.onerror = OnError;
  }  

  sendMessage(message) {
    this.ws.send(message);
  }
}