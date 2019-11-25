import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../../environments/environment';
import {Tweet, TweetCount} from '../../models/tweet.model';

import {JsonService} from '../json/json.service';
import {LatLngBounds} from 'leaflet';


@Injectable({
  providedIn: 'root'
})
export class TweetService {

  constructor(private http: HttpClient, private jsonService: JsonService) {
  }

  getTweetCountByDateData(): Observable<TweetCount[]> {
    return this.jsonService.deserializeArray(
      this.http.get<TweetCount[]>(`${environment.API_BASE}/tweet/tweet-count`), TweetCount);
  }

  getFireTweetData(oldBound: LatLngBounds, newBound: LatLngBounds, timeRange: number[]): Observable<Tweet[]> {
    return this.jsonService.deserializeArray(this.http.post<Tweet[]>(`${environment.API_BASE}/tweet/fire-tweet2`,
      JSON.stringify({
        oldBound,
        newBound,
        startDate: timeRange[0],
        endDate: timeRange[1],
      })
    ), Tweet);
  }

}
