import {Component, OnInit} from '@angular/core';
import {latLng, Map, MapOptions, tileLayer} from 'leaflet';
import {FirePolygonLayer} from '../layer/fire-polygon.layer';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {FireTweetLayer} from '../layer/fire-tweet.layer';
import {TempLayer} from '../layer/temperature.layer';
import {TweetService} from '../../../services/tweet/tweet.service';

@Component({
  selector: 'app-core-map',
  templateUrl: './core-map.component.html',
  styleUrls: ['./core-map.component.css']
})
export class CoreMapComponent implements OnInit {
  private tweetLayer: FireTweetLayer;
  private temperatureLayer: TempLayer;

  constructor(private timeService: TimeService, private fireService: FireService, private tweetService: TweetService) {

  }

  baseUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
    'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  layers = {
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

  map: Map;

  zoom = 5;
  center = latLng([36.879966, -101.726909]);

  layersControl = {
    baseLayers: this.layers,
    overlays: {}
  };
  options: MapOptions = {
    preferCanvas: true,
    layers: [this.layers.Dark]
  };

  ngOnInit() {
    this.layersControl.overlays['Fire Polygon'] = new FirePolygonLayer(this.timeService, this.fireService);
    this.tweetLayer = this.layersControl.overlays['Fire Tweets'] = new FireTweetLayer(this.timeService, this.tweetService);
    this.temperatureLayer = this.layersControl.overlays['Temperature Heatmap'] = new TempLayer(this.fireService);
  }

  onMapReady(map: Map) {
    this.map = map;
  }


}
