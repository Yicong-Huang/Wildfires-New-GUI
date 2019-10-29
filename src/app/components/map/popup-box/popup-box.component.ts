import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'popup-box',
  template: `
      <button id="try">click</button>`,
  styleUrls: ['./popup-box.component.css']
})
export class PopupBoxComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}

