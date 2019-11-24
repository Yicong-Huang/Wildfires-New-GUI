import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatTabsModule} from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [SearchBarComponent],
  exports: [
    SearchBarComponent,

  ],
  imports: [
    CommonModule,
    LeafletModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatTabsModule,
    BrowserAnimationsModule
  ]
})
export class SearchModule {
}
