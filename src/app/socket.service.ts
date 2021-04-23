import { Injectable } from "@angular/core";
import { Socket } from 'ngx-socket-io';
import { environment } from '../environments/environment';

@Injectable()
export class WebSocketService {

    constructor(private socket: Socket) {}

    sendMessage(msg: string) {
        console.log("work",msg)
        this.socket.emit('message', msg);
    }
    getMessage() {
      return this.socket.fromEvent(environment.id);
    }
}