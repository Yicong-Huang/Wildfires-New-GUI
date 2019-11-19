import {
  Canvas,
  canvas,
  CircleMarker,
  CircleMarkerOptions,
  LatLngBounds,
  LayerGroup,
  Map,
  MarkerClusterGroup,
  MarkerClusterGroupOptions
} from 'leaflet';
import 'leaflet.markercluster';
import {TimeService} from '../../../services/time/time.service';
import {TweetService} from '../../../services/tweet/tweet.service';
import {Tweet} from '../../../models/tweet.model';
import {fromEvent, Observable, of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export class TweetMarker extends CircleMarker {
  private _tweet: Tweet;

  // noinspection JSAnnotator
  constructor(tweet: Tweet, mouseOnMarker: (event: any) => void, options?: CircleMarkerOptions) {
    super(tweet.getLatLng(), options);
    this.tweet = tweet;
    this.on('mouseover', mouseOnMarker);
  }

  get tweet() {
    return this._tweet;
  }

  set tweet(value: Tweet) {
    this._tweet = value;
  }
}

export class FireTweetLayer extends LayerGroup {

  private map;
  private tweets: TweetMarker[] = [];
  private currentMapBound: LatLngBounds;
  private currentTimeRange: number[];

  private readonly markerClusterOptions: MarkerClusterGroupOptions;
  private readonly canvas: Canvas;
  private clusterGroup: MarkerClusterGroup;
  private tweetMarkerStyleOption: CircleMarkerOptions = {
    radius: 2, color: '#e25822', fillColor: '#e25822',
    renderer: this.canvas
  };
  private timeRangeChangeSubscription: Subscription;
  private mapChangeSubscription: Subscription;

  constructor(private timeService: TimeService, private tweetService: TweetService) {
    super();


    this.markerClusterOptions = {
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 8,
      chunkedLoading: true
    };
    this.canvas = canvas({padding: 0.5});
  }

  markerClusterReady(markerClusterGroup: MarkerClusterGroup) {
    this.clusterGroup = markerClusterGroup;
  }

  onAdd(map: Map): this {
    if (this.map === undefined) {
      this.map = map;
    }
    this.currentMapBound = this.map.getBounds();
    this.currentTimeRange = this.timeService.getRangeDate();
    this.mapChangeSubscription = fromEvent(this.map, 'moveend').pipe(switchMap(() => this.requestTweetsDifference()))
      .subscribe((tweets: Tweet[]) => this.updateTweets(tweets));
    this.timeRangeChangeSubscription = this.timeService.timeRangeChange$.pipe(switchMap(() => this.requestTweetsDifference()))
      .subscribe((tweets: Tweet[]) => this.updateTweets(tweets));
    this.requestTweetsDifference(true).subscribe((tweets) => this.updateTweets(tweets));
    return this;
  }

  onRemove(map: Map): this {
    this.clusterGroup.clearLayers();
    this.timeRangeChangeSubscription.unsubscribe();
    this.mapChangeSubscription.unsubscribe();
    return this;
  }


  addTweetsToMap(tweets: Tweet[]) {
    for (const tweet of tweets) {
      this.tweets.push(new TweetMarker(tweet, this.mouseOnMarker, this.tweetMarkerStyleOption));
    }
    this.clusterGroup.addLayers(this.tweets);
  }

  getMarkerClusterOptions() {
    return this.markerClusterOptions;
  }

  requestTweetsDifference(forceRefreshAll?: boolean): Observable<Tweet[]> {
    let newTimeRange = this.timeService.getRangeDate();
    const newMapBound = this.map.getBounds();

    const timeUpdateNeeded = this.currentTimeRange[0] > newTimeRange[0] || this.currentTimeRange[1] < newTimeRange[1];
    const boundUpdateNeeded = !this.currentMapBound.contains(newMapBound);

    if (!forceRefreshAll && !boundUpdateNeeded && !timeUpdateNeeded) {
      return of([]);
    }
    if (timeUpdateNeeded) {
      if (newTimeRange[0] < this.currentTimeRange[0]) {
        newTimeRange = [newTimeRange[0], this.currentTimeRange[0]];
      } else if (newTimeRange[1] > this.currentTimeRange[1]) {
        newTimeRange = [this.currentTimeRange[1], newTimeRange[1]];
      }
    }

    return this.tweetService.getFireTweetData(this.currentMapBound, newMapBound, newTimeRange);
  }

  updateTweets(tweets: Tweet[]) {
    this.removeTweetsFromMap();
    this.currentTimeRange = this.timeService.getRangeDate();
    const newMapBound = this.map.getBounds();
    if (!this.currentMapBound.contains(newMapBound)) {
      this.currentMapBound = this.map.getBounds();
    }
    this.addTweetsToMap(tweets);
  }

  private removeTweetsFromMap() {
    const removeLayers = [];
    this.tweets = [];
    this.clusterGroup.getLayers().forEach((layer: TweetMarker) => {
      const [start, end] = this.timeService.getRangeDate();
      const tweetTime = layer.tweet.createAt.getTime();
      if (!this.map.getBounds().contains(layer.getLatLng()) || (tweetTime < start || tweetTime > end)) {
        removeLayers.push(layer);
      } else {
        this.tweets.push(layer);
      }

    });

    this.clusterGroup.removeLayers(removeLayers);

  }

  addPopup(circle: TweetMarker, resp: any, error: boolean) {
    if (!error) {
      circle.bindPopup(resp.html).openPopup();
    } else {
      circle.bindPopup('<p>This tweet has been deleted.</p>').openPopup();
    }
  }

  mouseOnMarker = (event) => {
    const tweetId = event.target._tweet.id;
    const url = 'https://api.twitter.com/1/statuses/oembed.json?id=' + tweetId;
    this.tweetService.getEmbededTweet(url).subscribe(resp => this.addPopup(event.target, resp, false), error => {
      this.addPopup(event.target, error, false);
    });

  };

}

