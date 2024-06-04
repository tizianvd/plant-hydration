import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  getEventStream(url: string): Observable<any> {
    return new Observable(observer => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = event => {
        observer.next(JSON.parse(event.data));
      };
      eventSource.onerror = error => {
        observer.error('EventSource failed: ' + error);
      };

      return () => {
        eventSource.close();
      };
    });
  }
}