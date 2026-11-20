import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  public isConnected = signal<boolean>(false);

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7001/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Koneksi ChatHub berhasil dibangun.');
        this.isConnected.set(true);
      })
      .catch(err => {
        console.error('Kesalahan koneksi ChatHub:', err);
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  public onReceiveMessage(callback: (user: string, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  public onUserJoined(callback: (user: string) => void): void {
    this.hubConnection.on('UserJoined', callback);
  }

  public sendMessage(user: string, message: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendMessage', user, message)
        .catch(err => console.error('Gagal mengirim pesan:', err));
    }
  }

  public notifyJoined(user: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('NotifyJoined', user)
        .catch(err => console.error('Gagal mengirim status gabung:', err));
    }
  }
}