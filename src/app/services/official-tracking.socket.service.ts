import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environments';
import { OfficialTrackingPayload } from 'src/app/models/territorial/official-tracking';

@Injectable({ providedIn: 'root' })
export class OfficialTrackingSocketService implements OnDestroy {
  private socket?: Socket;
  private readonly tracking$ = new Subject<OfficialTrackingPayload>();
  private readonly connected$ = new BehaviorSubject<boolean>(false);

  get tracking(): Observable<OfficialTrackingPayload> {
    return this.tracking$.asObservable();
  }

  get connectionStatus(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const url = environment.socketUrl || environment.apiUrl;
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on('connect', () => this.connected$.next(true));
    this.socket.on('disconnect', () => this.connected$.next(false));
    this.socket.on('official_tracking', (data: OfficialTrackingPayload) => {
      if (data?.officials?.length) {
        this.tracking$.next(data);
      }
    });
  }

  disconnect(): void {
    this.socket?.off('official_tracking');
    this.socket?.disconnect();
    this.socket = undefined;
    this.connected$.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
