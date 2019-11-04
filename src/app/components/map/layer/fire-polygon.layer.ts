import {GeoJSON, geoJSON, icon, latLng, LayerGroup, Map, marker, Marker} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {NgElement, WithProperties} from '@angular/elements';
import {PopupBoxComponent} from '../popup-box/popup-box.component';

export class FirePolygonLayer extends LayerGroup {

  constructor(private timeService: TimeService, private fireService: FireService) {
    super();
    this.timeService.timeRangeChange$.subscribe(this.timeRangeChangeFirePolygonHandler);
  }

  private polygons: GeoJSON[];
  private polygon: GeoJSON;
  private markers: Marker[] = [];
  private firePolygon;
  private startDate;
  private endDate;
  private map;
  private fireObjectInfo;

  onAdd(map: Map): this {
    this.map = map;
    this.map.on('zoomend, moveend', this.getFirePolygonOnceMoved);
    this.polygons = [];
    const [start, end] = this.timeService.getRangeDate();
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData();
    return this;
  }

  onRemove(map: Map): this {
    console.log('on remove');
    if (this.polygon) {
      this.polygon.remove();
    }
    if (this.markers) {
      this.markers.forEach(circle => circle.remove());
    }
    return this;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    // this.polygons.forEach((polygon) => polygon.remove());
    console.log(data);
    if (this.polygon) {
      this.polygon.remove();
    }
    if (this.markers) {
      this.markers.forEach(circle => circle.remove());
    }
    if (this.map.getZoom() < 8) {
      for (const singlePoint of data.features) {
        const latlng = latLng(singlePoint.geometry.coordinates[1], singlePoint.geometry.coordinates[0]);
        const size = this.map.getZoom() * this.map.getZoom();
        const fireIcon = icon({
          iconUrl: 'assets/image/pixelfire.gif',
          iconSize: [size, size],
        });
        const singleMarker = marker(latlng, {icon: fireIcon}).bindPopup(fl => {
          const popupEl: NgElement & WithProperties<PopupBoxComponent> = document.createElement('popup-element') as any;
          popupEl.fireId = singlePoint.id;
          document.body.appendChild(popupEl);
          return popupEl;
        }).openPopup();
        singleMarker.addTo(this.map);
        this.markers.push(singleMarker);
      }
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
  };
  tryFunc = () => {
    console.log('hello world');
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
  };

}

