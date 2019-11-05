import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Wind} from '../../models/wind.model';
import {HeatMap} from '../../models/heat-map.model';
import {Boundary} from '../../models/boundary.model';
import {SearchSuggestion} from '../../models/search-suggestion.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  // Declare data events for components to action
  temperatureChangeEvent = new EventEmitter();
  searchMarkerLoaded = new EventEmitter();
  hoverMarkerLoaded = new EventEmitter();
  markerRemove = new EventEmitter();
  searchNameLoaded = new EventEmitter();
  sendFireToFront = new EventEmitter();

  constructor(private http: HttpClient) {
  }



  getWildfirePredictionData(northEastBoundaries, southWestBoundaries, start, end): Observable<any> {
    return this.http.post(`${environment.API_BASE}/wildfire-prediction`, JSON.stringify({
      northEast: northEastBoundaries,
      southWest: southWestBoundaries,
      startDate: start,
      endDate: end,
    }));
  }




  getWindData(): Observable<Wind[]> {
    return this.http.get<Wind[]>(`${environment.API_BASE}/data/wind`);
  }

  getBoundaryData(stateLevel, countyLevel, cityLevel, northEastBoundaries, southWestBoundaries): Observable<Boundary> {

    return this.http.post<object>(`${environment.API_BASE}/search/boundaries`, JSON.stringify({
      states: stateLevel,
      cities: cityLevel,
      counties: countyLevel,
      northEast: northEastBoundaries,
      southWest: southWestBoundaries,
    })).pipe(map(data => {

      return {type: 'FeatureCollection', features: data};
    }));
  }

  getDropBox(userInput): Observable<SearchSuggestion[]> {
    // gets auto-completion suggestions
    return this.http.get<SearchSuggestion[]>(`${environment.API_BASE}/dropdownMenu`,
      {params: new HttpParams().set('userInput', userInput)});
  }


  getRecentTweetData(): Observable<any> {

    return this.http.get(`${environment.API_BASE}/tweet/recent-tweet`);
  }

  getTemperatureData(): Observable<HeatMap[]> {
    return this.http.get<HeatMap[]>(`${environment.API_BASE}/data/recent-temp`);
  }

  getClickData(lat, lng, radius, timestamp, range): Observable<any> {

    return this.http.post(`${environment.API_BASE}/data/aggregation`, JSON.stringify({
      lat, lng, radius, timestamp, range
    }));
  }

  getIntentTweetData(id): Observable<any> {
    return this.http.get(`${environment.API_BASE}/tweet/tweet-from-id`,
      {params: new HttpParams().set('tweet_id', id)});
  }
}
