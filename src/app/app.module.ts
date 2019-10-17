import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MapModule} from './map/map.module';
import {TimeModule} from './time/time.module';
import {HttpClientModule} from '@angular/common/http';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MapModule,
    TimeModule,
    HttpClientModule,
    BrowserModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
