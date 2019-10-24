import {GeoJSON, geoJSON, LayerGroup, Map} from 'leaflet';
import {TimeService} from '../../services/time/time.service';
import {FireService} from '../../services/fire/fire.service';


export class FirePolygonLayer extends LayerGroup {
  private polygons: GeoJSON[];
  private polygon: GeoJSON;

  private dateStartInISO;
  private dateEndInISO;
  private map;


  constructor(private timeService: TimeService, private fireService: FireService) {
    super();
    this.timeService.timeRangeChange.subscribe(this.timeRangeChangeFirePolygonHandler);
  }

  onAdd(map: Map): this {
    this.map = map;
    this.polygons = [];
    console.log(map.getBounds());
    console.log('on Add');
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
    const [start, end] = this.timeService.getRangeDate();
    const dateStartInISO = new Date(start).toISOString();
    const dateEndInISO = new Date(end).toISOString();
    this.fireService.getFirePolygonData(boundNE, boundSW, size, dateStartInISO, dateEndInISO).subscribe(this.firePolygonDataHandler);

    return undefined;
  }

  onRemove(map: Map): this {
    console.log('on remove');

    return undefined;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    this.polygons.forEach((polygon) => polygon.remove());

    for (const feature of data.features) {
      console.log(feature);
      const polygon = geoJSON(({
        type: 'Polygon',
        coordinates: [[feature.geometry.coordinates]]
      }) as any, {
        style: () => ({
          fillColor: 'yellow',
          weight: 2,
          opacity: 0.8,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.5
        })
      }).addTo(this.map);
      feature.type = 'Polygon';
    }
    data.type = 'Polygon';
    geoJSON(data, {
      style: () => ({
        fillColor: 'yellow',
        weight: 2,
        opacity: 0.8,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
      })
    }).addTo(this.map);

  };
  onEachFeature = (feature, layer) => {
    // controls the interaction between the mouse and the map
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.zoomToFeature
    });
  };
  highlightFeature = (event) => {
    // highlights the region when the mouse moves over the region
    const layer = event.target;
    layer.setStyle({
      weight: 5,
      color: '#e37927',
      dashArray: '',
      fillOpacity: 0.7
    });

  };
  resetHighlight = (event) => {
    // gets rid of the highlight when the mouse moves out of the region

    this.polygon.resetStyle(event.target);
  };

  zoomToFeature = (event) => {
    // zooms to a region when the region is clicked
    this.map.fitBounds(event.target.getBounds());
  };


  timeRangeChangeFirePolygonHandler = ({start, end}) => {

    // processes given time data from time-series
    this.dateStartInISO = new Date(start).toISOString();
    this.dateEndInISO = new Date(end).toISOString();
    console.log(this.dateEndInISO);
    console.log(this.dateEndInISO);

    console.log('in updating');

  };


}

