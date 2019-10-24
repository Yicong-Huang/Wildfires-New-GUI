import {canvas, CircleMarker, circleMarker, LatLng, LayerGroup, Map} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {TweetService} from '../../../services/tweet/tweet.service';
import {Tweet} from '../../../models/tweet.model';


export class FireTweetLayer extends LayerGroup {

  private map;
  private tweetRender = canvas({padding: 0.5});
  private tweetColor = 'red';
  private tweets: CircleMarker[] = [];

  constructor(private timeService: TimeService, private tweetService: TweetService) {
    super();

  }

  onAdd(map: Map): this {
    this.map = map;
    this.tweetService.getFireTweetData().subscribe(tweets => this.addTweetsToMap(tweets, map));

    return this;
  }

  addTweetsToMap(tweets: Tweet[], map: Map) {
    for (const tweet of tweets) {
      this.addOneTweet(map, tweet.getLatLng());
    }
  }

  addOneTweet(map: Map, latLng: LatLng) {
    const circle = circleMarker(latLng, {
      renderer: this.tweetRender,
      color: this.tweetColor,
      radius: 0.1
    }).addTo(map);
    this.tweets.push(circle);
  }

  onRemove(map: Map): this {
    console.log('on remove');
    this.tweets.forEach(tweet => tweet.remove());
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

