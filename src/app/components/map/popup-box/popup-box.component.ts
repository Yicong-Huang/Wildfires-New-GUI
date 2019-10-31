import {Component, OnInit} from '@angular/core';
import {FireService} from '../../../services/fire/fire.service';

@Component({
  selector: 'popup-box',
  templateUrl: './popup-box.component.html',
  styleUrls: ['./popup-box.component.css']
})
export class PopupBoxComponent implements OnInit {
  constructor(private fireService: FireService) {
  }

  ngOnInit() {
  }

  click() {
    alert('hello');
  }
}

