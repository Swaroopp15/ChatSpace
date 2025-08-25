import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subscriber } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket;
  private isConnected = false;

  constructor() {
    // Initialize socket connection
    this.socket = io(environment.backendUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      forceNew: true,
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupConnectionEvents();
  }

  /** Setup basic socket events */
  private setupConnectionEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });
  }

  /** Generic event listener (returns Observable) */
  private listen<T>(event: string): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      const handler = (data: T) => observer.next(data);
      this.socket.on(event, handler);

      // Cleanup when unsubscribed
      return () => {
        this.socket.off(event, handler);
      };
    });
  }

  /** Join a room */
  joinRoom(data: { room: string; username: string }) {
    if (this.isConnected) {
      this.socket.emit('join', data);
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('join', data);
      });
    }
  }

  /** Send chat message */
  sendMessage(data: { room: string; username: string; msg: string }): Promise<{ status: string }> {
    if (this.isConnected) {
      this.socket.emit('send_message', data);
      return Promise.resolve({ status: 'sent' });
    }
    return Promise.reject('Not connected to server');
  }

  /** Send media (image, video, etc.) */
  sendMedia(media: any) {
    this.socket.emit('media', media);
  }

  /** Send reaction */
  sendReaction(data: { messageId: string; emoji: string; userId: string; action: 'add' | 'remove' }): Promise<{ status: string }> {
    if (this.isConnected) {
      this.socket.emit('send_reaction', data);
      return Promise.resolve({ status: 'sent' });
    }
    return Promise.reject('Not connected to server');
  }

  /** Typing indicators */
  typing(data: { room: string; username: string }) {
    if (this.isConnected) {
      this.socket.emit('typing', data);
    }
  }

  stopTyping(data: { room: string }) {
    if (this.isConnected) {
      this.socket.emit('stop_typing', data);
    }
  }

  /** Listeners */
  onReceiveMessage() {
    return this.listen<any>('receive_message');
  }

  onReceiveMedia() {
    return this.listen<any>('media');
  }

  onUpdateUsers() {
    return this.listen<any>('update_users');
  }

  onShowTyping() {
    return this.listen<any>('show_typing');
  }

  onHideTyping() {
    return this.listen<any>('hide_typing');
  }

  onReactionUpdate() {
    return this.listen<any>('reaction_update');
  }

  /** Connection status */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /** Disconnect socket */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /** Angular lifecycle hook */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
