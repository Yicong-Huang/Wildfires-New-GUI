import {Component, OnInit} from '@angular/core';
import {canvas, latLng, LatLng, Map, polygon, tileLayer} from 'leaflet';
import 'leaflet.markercluster';
import {MyCircleLayer} from '../layer/my.circle.layer';
import {TimeService} from '../../services/time/time.service';

@Component({
  selector: 'app-core-map',
  templateUrl: './core-map.component.html',
  styleUrls: ['./core-map.component.css']
})
export class CoreMapComponent implements OnInit {
  constructor(private timeService: TimeService) {
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
    center: latLng(this.optionsSpec.center),
    renderer: canvas({padding: 0.1})
  };
  // Form bindings
  formZoom = this.zoom;

  lat = this.center.lat;
  lng = this.center.lng;
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
      // 'Big Circle': this.points,
      'Big Square': polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]]),
      // 'marker Cluster Group':
    }
  };

  ngOnInit() {
    this.layersControl.overlays['My Circle'] = new MyCircleLayer(this.timeService);
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
    console.log('this is map');
    console.log(map);
  }


}
