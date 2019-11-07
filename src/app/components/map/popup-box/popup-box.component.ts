import {Component, Input, OnInit} from '@angular/core';
import {FireService} from '../../../services/fire/fire.service';
import {MapService} from '../../../services/map/map.service';

@Component({
  selector: 'popup-box',
  template: '<button (click)="click()">{{ message }}</button>',
  styleUrls: ['./popup-box.component.css']
})
export class PopupBoxComponent implements OnInit {
  @Input() fireId: string;
  @Input() message = 'Default Pop-up Message.';
  @Input() zoomOutCenter;
  @Input() zoomOutLevel;
  constructor(private fireService: FireService, private mapService: MapService) {
  }

  ngOnInit() {
  }

  click() {
    if (this.message === 'zoom in') {
      this.fireService.getFireBoundingBox(this.fireId).subscribe(this.mapZoomInHandler);
    } else {
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
  }
}

