import {Component, OnInit} from '@angular/core';
import {latLng, LatLng, Map, tileLayer} from 'leaflet';
import {FirePolygonLayer} from '../layer/fire-polygon.layer';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {FireTweetLayer} from '../layer/fire-tweet.layer';
import {TweetService} from '../../../services/tweet/tweet.service';


@Component({
  selector: 'app-core-map',
  templateUrl: './core-map.component.html',
  styleUrls: ['./core-map.component.css']
})
export class CoreMapComponent implements OnInit {
  layersControl = {
    baseLayers: {
      'Dark Map': tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
        'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.dark',
        attribution: 'Dark'
      }),
      'Street Map': tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
        'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.streets',
        attribution: 'Streets'
      }),
      'Satellite Map': tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
        'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.satellite',
        attribution: 'Satellite'
      })
    },
    overlays: {
      'Fire Tweets': new FireTweetLayer(this.timeService, this.tweetService),
      'Fire Polygon': new FirePolygonLayer(this.timeService, this.fireService)
    }
  };

  constructor(private timeService: TimeService, private fireService: FireService, private tweetService: TweetService) {

  }

  map: Map;
  optionsSpec: any = {
    baseUrl: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej' +
      'Y4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    get layers() {
      return [ //
        tileLayer(this.baseUrl, {
          id: 'mapbox.satellite', attribution: 'Satellite'
        }),

        tileLayer(this.baseUrl, {
          id: 'mapbox.streets', attribution: 'Streets'
        }),
        tileLayer(this.baseUrl, {
          id: 'mapbox.dark', attribution: 'Dark'
        }),
      ];
    },
    zoom: 5,
    center: [46.879966, -121.726909]
  };
  // Leaflet bindings

  zoom = this.optionsSpec.zoom;
  center = latLng(this.optionsSpec.center);
  options = {
    layers: this.optionsSpec.layers,
    zoom: this.optionsSpec.zoom,
    center: latLng(this.optionsSpec.center)
  };
  // Form bindings
  formZoom = this.zoom;

  lat = this.center.lat;
  lng = this.center.lng;
  private tweetLayer: FireTweetLayer;

  ngOnInit() {

    this.tweetLayer = this.layersControl.overlays['Fire Tweets'];

  }

  // Output binding for center
  onCenterChange(center: LatLng) {
    setTimeout(() => {
      this.lat = center.lat;
      this.lng = center.lng;
    });
  }

  onZoomChange(zoom: number) {
    setTimeout(() => {
      this.formZoom = zoom;
    });
  }

  onMapReady(map: Map) {
    this.map = map;
  }


}
