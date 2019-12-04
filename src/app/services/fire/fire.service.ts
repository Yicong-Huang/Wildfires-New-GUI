import {EventEmitter, Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FireService {
  getMultiplePolygonEvent$ = new EventEmitter();

  constructor(private http: HttpClient) {
  }

  searchFirePolygon(id, size): Observable<object> {
    return this.http.post(`${environment.API_BASE}/data/fire-with-id`, JSON.stringify({
      id, size
    }));
  }

  searchSeparatedFirePolygon(id, size): Observable<object> {
    return this.http.post(`${environment.API_BASE}/data/fire-with-id-seperated`, JSON.stringify({
      id, size,
    })).pipe(map(data => {
      return {type: 'FeatureCollection', features: data};
    }));
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

  getFireBoundingBox(id): Observable<object> {
    return this.searchFirePolygon(id, 2);
  }

  getMultiplePolygon(id) {
    this.getMultiplePolygonEvent$.next(id);
    // this.searchSeparatedFirePolygon(id, 2).subscribe(this.getMultiplePolygonEvent);
  }
}
