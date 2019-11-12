import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../../environments/environment';
import {TweetCount} from '../../models/tweet-count.model';
import {Tweet} from '../../models/tweet.model';

import {JsonService} from '../json/json.service';
import {LatLngBounds} from 'leaflet';


@Injectable({
  providedIn: 'root'
})
export class TweetService {

  constructor(private http: HttpClient, private jsonService: JsonService) {
  }

  getTweetCountByDateData(): Observable<TweetCount[]> {
    return this.http.get<TweetCount[]>(`${environment.API_BASE}/tweet/tweet-count`);
  }

  getFireTweetData(oldBound: LatLngBounds, newBound: LatLngBounds, start, end): Observable<Tweet[]> {
    return this.jsonService.deserialize(this.http.post<Tweet[]>(`${environment.API_BASE}/tweet/fire-tweet2`,
      JSON.stringify({
        oldBound,
        newBound,
        startDate: start,
        endDate: end,
      })
    ), Tweet);
  }

}
