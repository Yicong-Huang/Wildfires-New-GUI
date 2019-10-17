import {Component, OnInit} from '@angular/core';
import {
  circle,
  latLng,
  LatLng,
  polygon,
  tileLayer,
  layerGroup,
  marker,
  Marker,
  canvas,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  icon,
  MarkerCluster,
  Browser, Circle, Canvas, LayerGroup
} from 'leaflet';
import 'leaflet.markercluster';


@Component({
  selector: 'app-core-map',
  templateUrl: './core-map.component.html',
  styleUrls: ['./core-map.component.css']
})
export class CoreMapComponent implements OnInit {
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
    renderer: canvas({padding: 0.5})
  };

  private points: LayerGroup;
  canvas: Canvas = canvas({padding: 0.5});
  // Form bindings
  formZoom = this.zoom;
  zoomLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  lat = this.center.lat;
  lng = this.center.lng;
  circles: L.Layer[];
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
  drawOptions = {
    position: 'topright',
    draw: {
      // marker: {
      //   icon: L.icon({
      //     iconSize: [25, 41],
      //     iconAnchor: [13, 41],
      //     iconUrl: 'assets/marker-icon.png',
      //     shadowUrl: 'assets/marker-shadow.png'
      //   })
      // },
      polyline: false,
      circle: {
        shapeOptions: {
          color: '#aaaaaa'
        }
      }
    }
  };


  constructor() {
  }

  ngOnInit() {
    this.circles = [];
    for (let i = 0; i < 10; i++) {
      this.circles.push(circle([this.generateLon(), this.generateLat()], {
        radius: 100,
        renderer: this.canvas,
        color: 'red'
      }));
    }


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

  doApply() {
    this.center = latLng(this.lat, this.lng);
    this.zoom = this.formZoom;
  }

  generateLat() {
    return Math.random() * 360 - 180;
  }

  generateLon() {
    return Math.random() * 180 - 90;
  }

  generateData(count: number): Marker[] {

    const data: L.Marker[] = [];

    for (let i = 0; i < count; i++) {

      data.push(new Marker([this.generateLon(), this.generateLat()]));
    }


    return data;

  }


}
