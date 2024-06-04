import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(private http: HttpClient) { }
    
    public getData(): Observable<any> {
        return this.http.get('http://localhost:3000/api/mqtt/data');
    }

    public getHistory(sensor: string, unit: "minutes" | "hours" | "days" | "weeks" | "months"): Observable<any> {
        return this.http.get(`http://localhost:3000/api/mqtt/history/${sensor}/${unit}`);
    }
}