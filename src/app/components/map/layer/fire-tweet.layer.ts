import {Canvas, canvas, CircleMarker, Icon, LatLng, LayerGroup, Map, MarkerClusterGroupOptions} from 'leaflet';
import 'leaflet.markercluster';
import {TimeService} from '../../../services/time/time.service';
import {TweetService} from '../../../services/tweet/tweet.service';
import {Tweet} from '../../../models/tweet.model';


export class FireTweetLayer extends LayerGroup {

  private map;
  private tweets: CircleMarker[] = [];
  private markerClusterData: CircleMarker[] = [];
  private tweetIcon = new Icon({iconUrl: 'assets/image/perfectBird.gif', iconSize: [18, 18]});
  private lastUpdateTime: Date = new Date();
  private isOn = false;
  private currentZoomLevel: number;

  private readonly markerClusterOptions: MarkerClusterGroupOptions;
  private readonly canvas: Canvas;

  constructor(private timeService: TimeService, private tweetService: TweetService) {
    super();
    this.timeService.timeRangeChangeEvent.subscribe((event) => this.timeRangeChangeHandler(event));
    this.markerClusterOptions = {
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 8,
      chunkedLoading: true
    };
    this.canvas = canvas({padding: 0.5});


  }

  mapChangeHandler() {
    const newZoomLevel = this.map.getZoom();
    if (newZoomLevel <= this.currentZoomLevel) {
      if (this.isOn) {
        const now = new Date();
        const [start, end] = this.timeService.getRangeDate();
        this.updateTweets(start, end);
        this.lastUpdateTime = now;
      }
    }
    this.currentZoomLevel = newZoomLevel;

  }


  onAdd(map: Map): this {
    if (this.map === undefined) {
      this.map = map;
      this.map.on('moveend', () => this.mapChangeHandler());
    }
    this.currentZoomLevel = this.map.getZoom();
    this.isOn = true;
    if (this.tweets.length === 0) {
      const [start, end] = this.timeService.getRangeDate();
      this.updateTweets(start, end);
    } else {
      this.markerClusterData = this.tweets;
    }

    return this;
  }

  addTweetsToMap(tweets: Tweet[], map: Map) {
    this.removeTweets();
    for (const tweet of tweets) {
      this.addOneTweet(map, tweet.getLatLng());
    }
    this.markerClusterData = this.tweets;
  }

  addOneTweet(map: Map, latLng: LatLng) {
    this.tweets.push(new CircleMarker(latLng, {
      radius: 2, color: '#e25822', fillColor: '#e25822',
      renderer: this.canvas
    }));
  }

  onRemove(map: Map): this {
    this.removeTweets();
    this.isOn = false;
    return this;
  }

  removeTweets() {
    this.tweets.forEach(tweet => tweet.remove());
    this.markerClusterData = [];
    this.tweets = [];

  }

  getTweets() {
    return this.markerClusterData;
  }

  getMarkerClusterOptions() {
    return this.markerClusterOptions;
  }

  timeRangeChangeHandler({start, end}) {
    if (this.isOn) {
      const now = new Date();
      const diffInSecs = (now.getTime() - this.lastUpdateTime.getTime()) / 1000;

      if (diffInSecs > 1) {
        this.updateTweets(start, end);
        this.lastUpdateTime = now;
      }
    }

  }

  updateTweets(start, end) {
    const bound = this.map.getBounds();
    this.tweetService.getFireTweetData({
      lat: bound._northEast.lat, lon: bound._southWest.lng
    }, {
      lat: bound._southWest.lat, lon: bound._northEast.lng
    }, start, end).subscribe(tweets => {
      this.addTweetsToMap(tweets, this.map);
    });

  }

  // TODO: for test purpose only, to be removed
  generatingLatLng(): LatLng {
    const bounds = this.map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();
    const lngSpan = northEast.lng - southWest.lng;
    const latSpan = northEast.lat - southWest.lat;
    return new LatLng(
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random());
  }

}

