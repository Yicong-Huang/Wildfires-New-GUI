import {Canvas, canvas, CircleMarker, Icon, LatLngBounds, LayerGroup, Map, MarkerClusterGroup, MarkerClusterGroupOptions} from 'leaflet';
import 'leaflet.markercluster';
import {TimeService} from '../../../services/time/time.service';
import {TweetService} from '../../../services/tweet/tweet.service';
import {Tweet} from '../../../models/tweet.model';


export class FireTweetLayer extends LayerGroup {

  private map;
  private tweets: CircleMarker[] = [];
  private tweetIcon = new Icon({iconUrl: 'assets/image/perfectBird.gif', iconSize: [18, 18]});
  private lastUpdateTime: Date = new Date();
  private isOn = false;
  private currentZoomLevel: number;
  private currentMapBound: LatLngBounds;

  private readonly markerClusterOptions: MarkerClusterGroupOptions;
  private readonly canvas: Canvas;
  private clusterGroup: MarkerClusterGroup;

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

  markerClusterReady(markerClusterGroup: MarkerClusterGroup) {
    this.clusterGroup = markerClusterGroup;

  }

  onAdd(map: Map): this {
    if (this.map === undefined) {
      this.map = map;
      this.map.on('moveend', () => this.mapChangeHandler());
      this.currentMapBound = this.map.getBounds();
    }
    this.currentZoomLevel = this.map.getZoom();
    this.isOn = true;
    if (this.tweets.length === 0) {
      const [start, end] = this.timeService.getRangeDate();
      this.updateTweets(start, end);
    } else {
      this.clusterGroup.addLayers(this.tweets);
    }
    return this;
  }

  onRemove(map: Map): this {
    this.clusterGroup.clearLayers();
    this.isOn = false;
    return this;
  }

  addTweetsToMap(tweets: Tweet[]) {
    this.tweets = [];
    for (const tweet of tweets) {
      this.tweets.push(new CircleMarker(tweet.getLatLng(), {
        radius: 2, color: '#e25822', fillColor: '#e25822',
        renderer: this.canvas
      }));
    }
    this.clusterGroup.addLayers(this.tweets);
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

  mapChangeHandler() {
    const newZoomLevel = this.map.getZoom();
    this.currentMapBound = this.map.getBounds();

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

  updateTweets(start, end) {
    const bound = this.map.getBounds();
    this.tweetService.getFireTweetData({
      lat: bound._northEast.lat, lon: bound._southWest.lng
    }, {
      lat: bound._southWest.lat, lon: bound._northEast.lng
    }, start, end).subscribe(tweets => {
      this.clusterGroup.clearLayers();
      this.addTweetsToMap(tweets);
    });

  }

}

