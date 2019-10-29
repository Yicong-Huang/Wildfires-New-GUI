import {GeoJSON, geoJSON, icon, LayerGroup, Map} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';

export class FirePolygonLayer extends LayerGroup {

  constructor(private timeService: TimeService, private fireService: FireService) {
    super();
    this.timeService.timeRangeChange.subscribe(this.timeRangeChangeFirePolygonHandler);
  }

  private polygons: GeoJSON[];
  private polygon: GeoJSON;
  private firePolygon;
  private startDate;
  private endDate;
  private map;
  private fireObjectInfo;

  private static formatPopUpContent(fireObject) {
    return '\n <div class="fire">\n '
      + '      <span class="name" style=\'color: #ff8420;\'> '
      + 'Fire Name: ' + fireObject.properties.name
      + '      </span><br> '
      + '      <span class="fire-starttime" style=\'color: #ff8420;\'>'
      + 'Fire Start Time: ' + fireObject.properties.starttime
      + '      </span><br>\n	 '
      + '      <span class="fire-endtime" style=\'color: #ff8420;\'>'
      + 'Fire End Time: ' + fireObject.properties.endtime
      + '      </span><br>\n	 '
      + '      <span class="fire-area" style=\'color: #ff8420;\'>'
      + 'Fire Area: ' + fireObject.properties.area + ' acres'
      + '      </span><br>\n	 '
      + '<span class="fire-agency" style=\'color: #ff8420;\'>'
      + 'Fire Agency: ' + fireObject.properties.agency
      + '      </span><br>\n	 '
      + '</div>\n';
  }

  onAdd(map: Map): this {
    this.map = map;
    this.map.on('zoomend, moveend', this.getFirePolygonOnceMoved);
    this.polygons = [];
    console.log(map.getBounds());
    console.log('on Add');
    const [start, end] = this.timeService.getRangeDate();
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData();
    return this;
  }

  onRemove(map: Map): this {
    console.log('on remove');
    this.polygon.remove();
    return this;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    // this.polygons.forEach((polygon) => polygon.remove());
    if (this.polygon) {
      this.polygon.remove();
    }
    if (this.map.getZoom() < 8) {
      data.type = 'circle';
      const size = 12.5;
      const fireIcon = icon({
        iconUrl: 'assets/image/perfectBird.gif',
        iconSize: [size, size],
      });
      console.log(data);
      this.polygon = geoJSON(data
      ).addTo(this.map);
    } else {
      data.type = 'Polygon';
      console.log(data);
      this.polygon = geoJSON(data, {
        style: () => ({
          fillColor: 'yellow',
          weight: 2,
          opacity: 0.8,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.5
        }), onEachFeature: this.onEachFeature
      }).addTo(this.map);
    }
  };
  popUpContentZoomIn = (fireObject) => {
    console.log('success');
    console.log(fireObject);
    /*
    // creates css style for the pop up content
    const fireInfoTemplate = $('<div />');
    // tslint:disable-next-line:max-line-length
    fireInfoTemplate.html('<button href="#" class="button-action" ' +
        'style="color: #ff8420; font-family: "Dosis", Arial, Helvetica, sans-serif">Zoom In</button><br>')
        .on('click',
            '.button-action', () => {
                // when the fire pop up is triggered, go into firePolygonZoomInDataHandler which handels the zoom in
                console.log('xxx');
                // this.fireObjectInfo = fireObject;
                // this.fireService.searchFirePolygon(fireObject.id, 2).subscribe(this.firePolygonZoomInDataHandler);
            });

    const content = FirePolygonLayer.formatPopUpContent(fireObject);
    fireInfoTemplate.append(content);
    return fireInfoTemplate[0];*/
  };
  onEachFeature = (feature, layer) => {
    // controls the interaction between the mouse and the map
    layer.on({
      // mouseover: this.highlightFeature,
      // mouseout: this.resetHighlight,
      click: this.zoomToFeature
    });
  };
  highlightFeature = (event) => {
    console.log(event);
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
    console.log(event);
    // gets rid of the highlight when the mouse moves out of the region

    this.polygon.resetStyle(event.target);
  };

  zoomToFeature = (event) => {
    console.log(event);
    // const latLngs = [event.target.getLatLng()];
    // const markerBounds = latLngBounds(latLngs);
    // this.map.fitBounds(markerBounds);
  };

  timeRangeChangeFirePolygonHandler = ({start, end}) => {
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData();
  };

  getFirePolygonData() {
    const zoom = this.map.getZoom();
    let size;
    if (zoom < 8) {
      size = 4;
    } else if (zoom < 9) {
      size = 3;
    } else {
      size = 2;
    }
    console.log('zoom ', zoom);
    // processes given time data from time-series
    // const [start, end] = this.timeService.getRangeDate();
    const dateStartInISO = new Date(this.startDate).toISOString();
    const dateEndInISO = new Date(this.endDate).toISOString();
    const bound = this.map.getBounds();
    console.log(bound);
    const boundNE = {lat: bound._northEast.lat, lon: bound._northEast.lng};
    const boundSW = {lat: bound._southWest.lat, lon: bound._southWest.lng};
    this.fireService.getFirePolygonData(boundNE, boundSW, size, dateStartInISO, dateEndInISO).subscribe(this.firePolygonDataHandler);
  }

  getFirePolygonOnceMoved = () => {
    if (this.startDate && this.endDate) {
      this.getFirePolygonData();
    }
  }


}

