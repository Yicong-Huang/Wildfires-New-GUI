import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../../environments/environment';
import {Wind} from '../../models/wind.model';

@Injectable({
  providedIn: 'root'
})
export class WindService {

  constructor(private http: HttpClient) {
  }

  getWindData(): Observable<Wind> {
    return this.http.get<Wind>(`http://${environment.host}:${environment.port}/data/wind`);
  }
}
