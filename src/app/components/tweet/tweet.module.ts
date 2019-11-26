import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TweetCardComponent} from './tweet-card/tweet-card.component';
import {NgxTweetModule} from 'ngx-tweet';

@NgModule({
  declarations: [TweetCardComponent],
  exports: [
    TweetCardComponent,
    NgxTweetModule
  ],
  imports: [
    CommonModule,
    NgxTweetModule,
  ]
})
export class TweetModule {

}
