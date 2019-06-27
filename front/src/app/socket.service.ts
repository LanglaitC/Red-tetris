import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private socket: Socket
  ) { }

  getUsers() {
    return this.socket.fromEvent<{name: string, grid: any, id: string}[]>('getUsers');
  }

  listenInvits() {
    return this.socket.fromEvent<{message: string, id: string, status: boolean}>('listenInvits');
  }

  startGame() {
    return this.socket.fromEvent('startGame');
  }

  connect(id) {
    this.socket.emit('addUser', id);
  }

  sendInvite(id, status: 'accept' | 'send' | 'decline') {
    this.socket.emit('inviteUser', {id, status});
  }

  disconnect() {
    this.socket.emit('disconnect');
  }
}
