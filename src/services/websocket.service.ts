import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../server/middleware/auth';
import { User } from '@shared/schema';

type WebSocketWithUser = WebSocket & { user?: User };

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocketWithUser> = new Set();
  private subscriptions: Map<string, Set<WebSocketWithUser>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocketWithUser, req) => {
      // Extract token from query parameters
      const token = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('token');
      
      // Authenticate the connection
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded) {
            // In a real app, you would fetch the user from the database
            // For now, we'll just store the user ID
            ws.user = { id: decoded.id } as User;
          }
        } catch (error) {
          console.error('WebSocket authentication failed:', error);
          ws.close(1008, 'Authentication failed');
          return;
        }
      }

      this.clients.add(ws);
      console.log('New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const { type, channel, data } = JSON.parse(message);
          this.handleMessage(ws, type, channel, data);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        // Remove from all subscriptions
        this.subscriptions.forEach((subscribers, channel) => {
          if (subscribers.has(ws)) {
            subscribers.delete(ws);
            if (subscribers.size === 0) {
              this.subscriptions.delete(channel);
            }
          }
        });
        console.log('WebSocket connection closed');
      });
    });
  }

  private handleMessage(ws: WebSocketWithUser, type: string, channel: string, data: any) {
    switch (type) {
      case 'subscribe':
        this.subscribe(ws, channel);
        break;
      case 'unsubscribe':
        this.unsubscribe(ws, channel);
        break;
      case 'publish':
        if (!ws.user) {
          ws.send(JSON.stringify({ 
            type: 'error',
            message: 'Unauthorized',
          }));
          return;
        }
        this.publish(channel, data, ws.user.id);
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error',
          message: 'Unknown message type',
        }));
    }
  }

  private subscribe(ws: WebSocketWithUser, channel: string) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)?.add(ws);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      channel,
    }));
  }

  private unsubscribe(ws: WebSocketWithUser, channel: string) {
    if (this.subscriptions.has(channel)) {
      const subscribers = this.subscriptions.get(channel)!;
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.subscriptions.delete(channel);
      }
    }
    
    ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
    }));
  }

  // Method to publish data to a channel
  public publish(channel: string, data: any, senderId?: number) {
    const subscribers = this.subscriptions.get(channel) || new Set();
    const message = JSON.stringify({
      type: 'message',
      channel,
      data,
      timestamp: new Date().toISOString(),
      ...(senderId && { senderId }),
    });

    subscribers.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Method to notify specific user
  public notifyUser(userId: number, data: any) {
    const message = JSON.stringify({
      type: 'notification',
      data,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.user?.id === userId) {
        client.send(message);
      }
    });
  }

  // Close all connections
  public close() {
    this.wss.close();
    this.clients.clear();
    this.subscriptions.clear();
  }
}
