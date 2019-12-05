import {Component, Input} from '@angular/core';


@Component({
  selector: 'tweet-card',
  styleUrls: ['./tweet-card.component.css'],
  templateUrl: './tweet-card.component.html'
})
export class TweetCardComponent {
  @Input() id;
  @Input() cnnValue;
  @Input() tweetText;
  @Input() tweetUser;
  @Input() displayBlock;
}
