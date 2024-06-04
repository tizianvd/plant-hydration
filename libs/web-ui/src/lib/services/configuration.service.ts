import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationsDictionary, UpdateConfigurationRequest } from '@plant-hydration/lib-api';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    constructor(private readonly http: HttpClient) { }

    updateConfiguration(req: UpdateConfigurationRequest) {
        return this.http.post('http://localhost:3000/api/configuration/update', req);
    }

    getConfiguration(group: string, key: string) {
        return this.http.get(`http://localhost:3000/api/configuration/${group}/${key}`);
    }

    getConfigurations() : Observable<ConfigurationsDictionary> {
        return this.http.get<ConfigurationsDictionary>('http://localhost:3000/api/configuration');
    }

    setConfigurations(configurations: ConfigurationsDictionary) : Observable<ConfigurationsDictionary>  {
        return this.http.post<ConfigurationsDictionary>('http://localhost:3000/api/configuration', configurations);
    }

    public getReferenceValues(): Observable<number[][]> {
        return this.http.get<number[][]>('http://localhost:3000/api/mqtt/reference-values');
    }
}