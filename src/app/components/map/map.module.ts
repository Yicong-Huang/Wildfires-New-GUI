import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';
import {createCustomElement} from '@angular/elements';

import {ClickMarkerComponent} from './click-marker/click-marker.component';
import {FirePolygonLayer} from './layer/fire-polygon.layer';
import {PopupBoxComponent} from './popup-box/popup-box.component';


@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent, PopupBoxComponent],
  imports: [
    CommonModule,
    LeafletModule,
  ],
  exports: [CoreMapComponent],
  providers: [FirePolygonLayer],
  entryComponents: [PopupBoxComponent]
})
export class MapModule {
  constructor(private injector: Injector) {
    const PopupElement = createCustomElement(PopupBoxComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('popup-element', PopupElement);
  }
}
