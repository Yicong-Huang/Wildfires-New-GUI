import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MapModule} from './map/map.module';
import {TimeModule} from "./time/time.module";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MapModule,
    TimeModule,
    BrowserModule,
    LeafletModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
