import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../socket.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  constructor(
    protected socketSvc: SocketService
  ) { }

  connected = false;
  names: {name: string, id: string}[] = [];
  inGame = false;
  _getUsersObserver: Subscription;

  ngOnInit() {
    const name = 'Jim Carrey';
    this._getUsersObserver = this.socketSvc.getUsers().subscribe(res => {
      if (!this.connected) {
        this.socketSvc.connect(name);
        this.connected = true;
        this.socketSvc.listenInvits().subscribe(ret => {
          if (ret.status === true) {
            this.inGame = true;
          }
          if (confirm(ret.message)) {
            this.socketSvc.sendInvite(ret.id, 'accept')
          }
        });
      }
      this.names = res.map(elmt => ({
        name: elmt.name,
        id: elmt.id
      }));
    })
  }

  sendInvite(id) {
    this.socketSvc.sendInvite(id, 'send')
  }

  ngOnDestroy() {
    this.socketSvc.disconnect();
    this._getUsersObserver.unsubscribe();
  }
}
