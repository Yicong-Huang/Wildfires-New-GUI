import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../../environments/environment';
import {TweetCount} from '../../models/tweet-count.model';
import {Tweet} from '../../models/tweet.model';
import {JsonConvert} from 'json2typescript';
import {JsonService} from '../json/json.service';


@Injectable({
  providedIn: 'root'
})
export class TweetService {
  API_BASE = `http://${environment.host}:${environment.port}`;
  jsonConvert: JsonConvert = new JsonConvert();

  constructor(private http: HttpClient, private jsonService: JsonService) {


  }

  getTweetCountByDateData(): Observable<TweetCount[]> {
    return this.http.get<TweetCount[]>(`${this.API_BASE}/tweet/tweet-count`);
  }

  getFireTweetData(): Observable<Tweet[]> {
    return this.jsonService.deserialize(this.http.get<Tweet[]>(`${this.API_BASE}/tweet/fire-tweet`), Tweet);
  }

}
