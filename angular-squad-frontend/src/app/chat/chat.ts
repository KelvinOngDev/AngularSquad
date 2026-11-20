import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat';

interface ChatItem {
  type: 'message' | 'system';
  user: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  public chatService = inject(ChatService);

  public userName = '';
  public isJoined = signal<boolean>(false);
  public messageInput = '';
  public items = signal<ChatItem[]>([]);

  ngOnInit(): void {
    this.chatService.startConnection();

    this.chatService.onReceiveMessage((user: string, message: string) => {
      this.items.update((current) => [
        ...current,
        { type: 'message', user, text: message, time: this.getCurrentTime() },
      ]);
    });

    this.chatService.onUserJoined((user: string) => {
      this.items.update((current) => [
        ...current,
        {
          type: 'system',
          user,
          text: `${user} bergabung ke ruang obrolan`,
          time: this.getCurrentTime(),
        },
      ]);
    });
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
  }

  public joinRoom(): void {
    const trimmed = this.userName.trim();
    if (!trimmed) return;

    this.userName = trimmed;
    this.isJoined.set(true);
    this.chatService.notifyJoined(trimmed);
  }

  public send(): void {
    const trimmedMessage = this.messageInput.trim();
    if (!this.isJoined() || !trimmedMessage) return;

    this.chatService.sendMessage(this.userName, trimmedMessage);
    this.messageInput = '';
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
