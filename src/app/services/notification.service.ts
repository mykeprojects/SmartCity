import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client'; //Libreria estandar para sockets
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private socket: Socket; //Variable de clase de tipo SOCKET

  constructor() {
    console.log('Inicializando NotificationService, conectando a WebSocket...');
    this.socket = io(environment.socketUrl, { //Inicialización del objeto
      transports: ['websocket']
    });
    console.log('Intentando conectar a WebSocket en', environment.socketUrl);

    this.socket.on('connect', () => { //Método para la conexión
      console.log('Conectado al servidor'); //Se crea el canal bidireccional
    });

    this.socket.on('disconnect', () => { //Si se desconecta 
      console.log('Desconectado del servidor');
    });

    this.socket.on('connect_error', (error) => { //Si hay un error
      console.error('Error conexión:', error);
    });
  }

  //On NewNotification es como un buzón que me recibe todos los topicos.
  onNewNotification(topic:string): Observable<any> { //¿Qué hago si me llega una nueva notificación?
    //Cada notificación me llega de un topico 
    return new Observable(observer => { //Observable es lo que se conoce como una promesa

      this.socket.on(topic, (data) => { //Me suscribo a un tópico en especial. 
        observer.next(data); //Estoy pendiente del topico y si llega algo lo notifico a todo el mundo
      });

    });
  }
}
