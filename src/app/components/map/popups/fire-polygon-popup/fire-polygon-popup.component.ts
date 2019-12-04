import {Component, Input, OnInit} from '@angular/core';
import {FireService} from '../../../../services/fire/fire.service';
import {MapService} from '../../../../services/map/map.service';

@Component({
  selector: 'popup-box',
  templateUrl: './fire-polygon-popup.component.html',
  styleUrls: ['./fire-polygon-popup.component.css']
})
export class FirePolygonPopupComponent implements OnInit {
  @Input() fireId: string | number;
  @Input() message = 'Default Pop-up Message.';
  @Input() zoomOutCenter;
  @Input() zoomOutLevel;
  @Input() fireName;
  @Input() fireStartTime;
  @Input() fireEndTime;
  @Input() fireArea;
  @Input() fireAgency;
  private showDisplayButton = false;

  constructor(private fireService: FireService, private mapService: MapService) {
  }

  ngOnInit() {
  }

  click() {
    if (this.message === 'zoom in') {
      this.showDisplayButton = false;
      this.fireService.getFireBoundingBox(this.fireId).subscribe(this.mapZoomInHandler);
    } else {
      this.showDisplayButton = true;
      this.mapService.zoomOut(this.zoomOutCenter, this.zoomOutLevel);
    }
  }

  mapZoomInHandler = (data) => {
    console.log(data);
    const bbox = data[0].bbox.coordinates[0];
    const firePolygonLL = [];
    for (const item of bbox) {// changes the lat and lng because the geojson format is different to the leaflet latlng format
      firePolygonLL.push([parseFloat(item[1]), parseFloat(item[0])]);
    }
    console.log('firePolygonLL' + firePolygonLL);
    this.mapService.zoomIn(firePolygonLL);
  };
  currentStyles = () => {
    return {
      display: this.message === 'zoom out' ? 'block' : 'none'
    };
  };

  displayMultiplePolygon() {
    this.fireService.getMultiplePolygon(this.fireId);
  }

}

