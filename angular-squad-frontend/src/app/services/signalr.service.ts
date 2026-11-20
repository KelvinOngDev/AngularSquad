import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public isConnected = signal<boolean>(false);

  public startConnection(): void {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7001/notificationHub', {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Koneksi SignalR berhasil dibangun.');
        this.isConnected.set(true);
      })
      .catch((error) => {
        console.error('Kesalahan saat membangun koneksi SignalR:', error);
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  public onNotification(callback: (message: string) => void): void {
    this.hubConnection.on('ReceiveNotification', callback);
  }
}
