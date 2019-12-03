import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient, HttpClientJsonpModule} from '@angular/common/http';

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

  getSingleTweet(id: string): Observable<Tweet> {
    return this.http.get<Tweet>(`${environment.API_BASE}/tweet/tweet-from-id?tweet_id=` + id);
  }

  checkSingleTweetExist(id: string): Observable<any> {
    return this.http.jsonp('https://api.twitter.com/1/statuses/oembed.json?id=' + id, 'callback');
  }

  getFireTweetData(oldBound: LatLngBounds, newBound: LatLngBounds, timeRange: number[]): Observable<Tweet[]> {
    return this.jsonService.deserialize(this.http.post<Tweet[]>(`${environment.API_BASE}/tweet/fire-tweet2`,
      JSON.stringify({
        oldBound,
        newBound,
        startDate: timeRange[0],
        endDate: timeRange[1],
      })
    ), Tweet);
  }

}
