import {geoJSON, GeoJSON, Layer, LayerGroup, LayerOptions, Map} from 'leaflet';
import {TimeService} from '../../services/time/time.service';
import {Injectable} from '@angular/core';

@Injectable()
export class MyCircleLayer extends LayerGroup {
  private target: GeoJSON<any>;
  private targetC: Layer[];
  private dateStartInISO;
  private dateEndInISO;

  constructor(private timeService: TimeService, layers?: Layer[], options?: LayerOptions) {
    super(layers, options);
    this.timeService.timeRangeChange.subscribe(this.timeRangeChangeFirePolygonHandler);
  }

  onAdd(map: Map): this {
    console.log(map.getBounds());
    console.log('on Add');
    this.target = geoJSON(({
      type: 'Polygon',
      coordinates: [[[-123, 43.87], [-120.5, 46.87], [-113.5, 46.93], [-121.6, 46.87]]]
    }) as any, {style: () => ({color: '#ff7800'})}).addTo(map);

    // const circles: Layer[] = [];
    // this.target = circle([this.generateLon(), this.generateLat()], {color: 'red'}).addTo(map);
    // for (let i = 0; i < 10; i++) {
    //   circles.push(circle([this.generateLon(), this.generateLat()], {radius: 100, color: 'red'}));
    // }
    // circles.forEach(c => {
    //   c.addTo(map);
    // });
    // this.targetC = circles;
    return undefined;
  }

  onRemove(map: Map): this {
    console.log('on remove');
    this.target.remove();
    return undefined;
  }

  timeRangeChangeFirePolygonHandler = ({start, end}) => {

    // processes given time data from time-series
    this.dateStartInISO = new Date(start).toISOString();
    this.dateEndInISO = new Date(end).toISOString();
    console.log(this.dateEndInISO);
    console.log(this.dateEndInISO);
  };

  /*    getFirePolygon = (start, end) => {
          // sends request to the map service based on the start/end time and the current screen map boundaries
          const zoom = this.map.getZoom();
          let size;
          if (zoom < 8) {
              size = 4;
          } else if (zoom < 9) {
              size = 3;
          } else {
              size = 2;
          }

          const bound = this.map.getBounds();
          const boundNE = {lat: bound._northEast.lat, lon: bound._northEast.lng};
          const boundSW = {lat: bound._southWest.lat, lon: bound._southWest.lng};
          this.mapService.getFirePolygonData(boundNE, boundSW, size, start, end).subscribe(this.firePolygonDataHandler);
      };*/
  generateLat() {
    return Math.random() * 360 - 180;
  }

  generateLon() {
    return Math.random() * 180 - 90;
  }
}
