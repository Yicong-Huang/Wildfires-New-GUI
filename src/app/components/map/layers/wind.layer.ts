import {Layer, LayerGroup, Map} from 'leaflet';
import 'leaflet-velocity-ts';
import {Wind} from '../../../models/wind.model';
import {WindService} from '../../../services/environmental-data/wind.service';

declare let L;

export class WindLayer extends LayerGroup {
  private layer: Layer;

  constructor(private windService: WindService) {
    super();
  }

  onAdd(map: Map): this {
    this.windService.getWindData().subscribe(data => this.windDataHandler(data, map));
    return this;
  }

  onRemove(map: Map): this {
    if (this.layer !== undefined) {
      this.layer.remove();
    }
    return this;
  }

  windDataHandler = (wind: Wind, map: Map) => {
    // there's not much document about leaflet-velocity.
    // all we got is an example usage from
    // github.com/0nza1101/leaflet-velocity-ts
    this.layer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        position: 'bottomleft', // REQUIRED !
        emptyString: 'No velocity data', // REQUIRED !
        angleConvention: 'bearingCW', // REQUIRED !
        velocityType: 'Global Wind',
        displayPosition: 'bottomleft',
        displayEmptyString: 'No wind data',
        speedUnit: 'm/s'
      },
      data: wind,
      maxVelocity: 12 // affect color and animation speed of wind
    });
    this.layer.addTo(map);
  };
}
