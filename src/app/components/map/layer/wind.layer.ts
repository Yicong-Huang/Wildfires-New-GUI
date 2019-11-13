import {FireService} from '../../../services/fire/fire.service';
import {LayerGroup, Map} from 'leaflet';
import 'leaflet-maskcanvas';
import 'leaflet-velocity-ts';
declare let L;

export class WindLayer extends LayerGroup {
  private map;
  private velocityLayer;

  constructor(private fireService: FireService) {
      super();
  }
  onAdd(map: Map): this {
    this.map = map;
    this.fireService.getWindData().subscribe( data => this.windDataHandler(data));
    return this;
  }

  onRemove(map: Map): this {
    if (this.velocityLayer) {
      this.velocityLayer.remove();
    }
    return this;
  }


  windDataHandler = (wind) => {
    // there's not much document about leaflet-velocity.
    // all we got is an example usage from
    // github.com/0nza1101/leaflet-velocity-ts
    this.velocityLayer = L.velocityLayer({
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
    this.velocityLayer.addTo(this.map);
  }
}
