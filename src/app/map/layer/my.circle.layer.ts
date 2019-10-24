import {geoJSON, GeoJSON, LayerGroup, Map} from 'leaflet';
import {TimeService} from '../../services/time/time.service';


export class MyCircleLayer extends LayerGroup {
  private target: GeoJSON<any>;

  private dateStartInISO;
  private dateEndInISO;
  private map;


  constructor(private timeService: TimeService) {
    super();
    this.timeService.timeRangeChange.subscribe(this.timeRangeChangeFirePolygonHandler);
  }

  onAdd(map: Map): this {
    this.map = map;
    console.log(map.getBounds());
    console.log('on Add');
    this.target = geoJSON(({
      type: 'Polygon',
      coordinates: [[[-123, 43.87], [-120.5, 46.87], [-113.5, 46.93], [-121.6, 46.87]]]
    }) as any, {style: () => ({color: '#ff7800'})}).addTo(map);
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
    this.target.remove();
    console.log('in updating');
    this.target = geoJSON(({
      type: 'Polygon',
      coordinates: [[[-123, 43.87], [-120.5, 46.87], [-113.5, 46.93], [-121.6, 46.87]]]
    }) as any, {style: () => ({color: 'red'})}).addTo(this.map);

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

}

