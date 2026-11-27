import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ChatService } from '../services/chat';

import { Chat } from './chat';

describe('Chat', () => {
  let component: Chat;
  let fixture: ComponentFixture<Chat>;
  const chatService = {
    isConnected: signal(false),
    startConnection: jasmine.createSpy('startConnection'),
    stopConnection: jasmine.createSpy('stopConnection'),
    onReceiveMessage: jasmine.createSpy('onReceiveMessage'),
    onUserJoined: jasmine.createSpy('onUserJoined'),
    sendMessage: jasmine.createSpy('sendMessage'),
    notifyJoined: jasmine.createSpy('notifyJoined'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [{ provide: ChatService, useValue: chatService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
