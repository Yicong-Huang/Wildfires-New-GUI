import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {Wind} from '../../models/wind.model';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  constructor(private http: HttpClient) {

  }

  searchFirePolygon(id, size): Observable<object> {
    return this.http.post(`${environment.API_BASE}/data/fire-with-id`, JSON.stringify({
      id,
      size
    }));
  }

  searchSeparatedFirePolygon(id, size): Observable<object> {
    return this.http.post(`${environment.API_BASE}/data/fire-with-id-seperated`, JSON.stringify({
      id, size,
    })).pipe(map(data => {
      return {type: 'FeatureCollection', features: data};
    }));
  }

  getWindData(): Observable<Wind> {
    return this.http.get<Wind>(`http://${environment.host}:${environment.port}/data/wind`);
  }

  getFirePolygonData(northEastBoundaries, southWestBoundaries, setSize, start, end): Observable<any> {

    return this.http.post(`${environment.API_BASE}/data/fire-polygon`, JSON.stringify({
      northEast: northEastBoundaries,
      southWest: southWestBoundaries,
      size: setSize,
      startDate: start,
      endDate: end,
    })).pipe(map(data => {

      return {type: 'FeatureCollection', features: data};
    }));
  }


}
