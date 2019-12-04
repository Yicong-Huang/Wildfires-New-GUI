import {Component, OnInit} from '@angular/core';
import {latLng, Map, MapOptions, tileLayer} from 'leaflet';
import {FirePolygonLayer} from '../layer/fire-polygon.layer';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {FireTweetLayer} from '../layer/fire-tweet.layer';
import {TweetService} from '../../../services/tweet/tweet.service';
import {WindLayer} from '../layer/wind.layer';
import {WindService} from '../../../services/environmental-data/wind.service';

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
    overlays: {
      Highways: tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
      Mountain_Elevation: tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
        maxZoom: 16
        }),
      NASAGIBS_ModisTerraLSTDay: tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Land_Surface_Temp_Day/default/GoogleMapsCompatible_Level{maxZoom}/{z}/{y}/{x}.png', {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        minZoom: 1,
        maxZoom: 7,
        opacity: 0.75
        }),
      // OpenWeatherMap_Wind: tileLayer('http://maps.openweathermap.org/maps/2.0/weather/TA2/{z}/{x}/{y}?appid=f155b82748c596a1a405d04c976c5604&\n' +
      //   'fill_bound=true&opacity=0.6&palette=-65:821692;-55:821692;-45:821692;-40:821692;\n' +
      //   '-30:8257db;-20:208cec;-10:20c4e8;0:23dddd;10:c2ff28;20:fff028;25:ffc228;30:fc8014', {
      //   maxZoom: 19,
      //   attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
      //   apiKey: 'f155b82748c596a1a405d04c976c5604',
      //   opacity: 0.5
      //   })

    }
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


}
