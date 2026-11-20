import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';

interface NotificationItem {
  text: string;
  time: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent implements OnInit {
  public signalRService = inject(SignalRService);
  public notifications = signal<NotificationItem[]>([]);

  ngOnInit(): void {
    this.signalRService.startConnection();

    this.signalRService.onNotification((message: string) => {
      const time = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      this.notifications.update((current) => [{ text: message, time }, ...current]);
    });
  }
}
