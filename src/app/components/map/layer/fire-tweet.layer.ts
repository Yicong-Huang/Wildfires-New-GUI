import {canvas, CircleMarker, circleMarker, LatLng, LayerGroup, Map, Marker, Icon} from 'leaflet';
import 'leaflet.markercluster';
import {TimeService} from '../../../services/time/time.service';
import {TweetService} from '../../../services/tweet/tweet.service';
import {Tweet} from '../../../models/tweet.model';
import {from} from 'rxjs';


export class FireTweetLayer extends LayerGroup {

  private map;
  private tweets: CircleMarker[] = [];
  private markerClusterData: CircleMarker[] = [];
  private tweetIcon = new Icon({iconUrl: 'assets/image/perfectBird.gif', iconSize: [18, 18]});

  constructor(private timeService: TimeService, private tweetService: TweetService) {
    super();
  }

  onAdd(map: Map): this {
    this.map = map;
    if (this.tweets.length === 0) {
      this.tweetService.getFireTweetData().subscribe(tweets => this.addTweetsToMap(tweets, map));
    } else {
      this.markerClusterData = this.tweets;
    }
    return this;
  }

  addTweetsToMap(tweets: Tweet[], map: Map) {
    for (const tweet of tweets) {
      this.addOneTweet(map, tweet.getLatLng());
    }
    this.markerClusterData = this.tweets;
  }

  addOneTweet(map: Map, latLng: LatLng) {
    const circle = new CircleMarker(latLng, {radius: 2, color: '#e25822', fillColor:'#e25822'} );
    this.tweets.push(circle);
  }

  onRemove(map: Map): this {
    this.tweets.forEach(tweet => tweet.remove());
    this.markerClusterData = [];
    return this;
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

