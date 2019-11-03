import {Component, OnInit} from '@angular/core';
import {latLng, Map, MapOptions, tileLayer} from 'leaflet';
import {FirePolygonLayer} from '../layer/fire-polygon.layer';
import {FireTweetLayer} from '../layer/fire-tweet.layer';
import {TweetService} from '../../../services/tweet/tweet.service';
import {WindLayer} from '../layer/wind.layer';
import {WindService} from '../../../services/environmental-data/wind.service';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';


@Component({
  selector: 'app-core-map',
  templateUrl: './core-map.component.html',
  styleUrls: ['./core-map.component.css']
})
export class CoreMapComponent implements OnInit {
  private tweetLayer: FireTweetLayer;

  private baseUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
    'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  private layers = {
    Satellite: tileLayer(this.baseUrl, {
      id: 'mapbox.satellite', attribution: 'Satellite'
    }),

    Streets: tileLayer(this.baseUrl, {
      id: 'mapbox.streets', attribution: 'Streets'
    }),
    Dark: tileLayer(this.baseUrl, {
      id: 'mapbox.dark', attribution: 'Dark'
    })
  };
  private map: Map;
  private zoom = 5;
  private center = latLng([36.879966, -101.726909]);
  private layersControl = {
    baseLayers: this.layers,
    overlays: {}
  };
  private options: MapOptions = {
    preferCanvas: true,
    layers: [this.layers.Dark]
  };

  constructor(private timeService: TimeService, private fireService: FireService, private windService: WindService,
              private tweetService: TweetService) {

  }

  ngOnInit() {
    this.layersControl.overlays['Fire Polygon'] = new FirePolygonLayer(this.timeService, this.fireService);
    this.tweetLayer = this.layersControl.overlays['Fire Tweets'] = new FireTweetLayer(this.timeService, this.tweetService);
    this.layersControl.overlays['Global Wind'] = new WindLayer(this.windService);
  }

  onMapReady(map: Map) {
    this.map = map;
  }

  zoomInToPolygon = ({zoomInBoundaries}) => {
    this.map.fitBounds(zoomInBoundaries);
  };
}
