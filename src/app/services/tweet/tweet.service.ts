import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../../environments/environment';
import {TweetCount} from '../../models/tweet-count.model';
import {Tweet} from '../../models/tweet.model';

import {JsonService} from '../json/json.service';


@Injectable({
  providedIn: 'root'
})
export class TweetService {

  constructor(private http: HttpClient, private jsonService: JsonService) {
  }

  getTweetCountByDateData(): Observable<TweetCount[]> {
    return this.http.get<TweetCount[]>(`${environment.API_BASE}/tweet/tweet-count`);
  }

  getFireTweetData(northEastBoundaries, southWestBoundaries, start, end): Observable<Tweet[]> {
    return this.jsonService.deserialize(this.http.post<Tweet[]>(`${environment.API_BASE}/tweet/fire-tweet`,
      JSON.stringify({
        northEast: northEastBoundaries,
        southWest: southWestBoundaries,
        startDate: start,
        endDate: end,
      })
    ), Tweet);
  }

}
