import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimeBarComponent} from './time-bar/time-bar.component';


@NgModule({
  declarations: [TimeBarComponent],
  exports: [
    TimeBarComponent
  ],
  imports: [
    CommonModule,
  ],
})
export class TimeModule {
}
