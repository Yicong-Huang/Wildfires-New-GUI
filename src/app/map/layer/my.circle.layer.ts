import {Circle, circle, Layer, LayerGroup, Map} from 'leaflet';

export class MyCircleLayer extends LayerGroup {
  private target: Circle<any>;
  private targetC: Layer[];

  onAdd(map: Map): this {
    console.log('on Add');
    const circles: Layer[] = [];
    this.target = circle([this.generateLon(), this.generateLat()], {color: 'red'}).addTo(map);
    for (let i = 0; i < 10; i++) {
      circles.push(circle([this.generateLon(), this.generateLat()], {radius: 100, color: 'red'}));
    }
    circles.forEach(c => {
      c.addTo(map);
    });
    this.targetC = circles;
    return undefined;
  }

  onRemove(map: Map): this {
    console.log('on remove');
    this.target.remove();
    this.targetC.forEach(c => {
      c.remove();
    });

    return undefined;
  }

  onClick(map: Map): this {
    console.log('on click');
    return undefined;
  }

  generateLat() {
    return Math.random() * 360 - 180;
  }

  generateLon() {
    return Math.random() * 180 - 90;
  }
}
