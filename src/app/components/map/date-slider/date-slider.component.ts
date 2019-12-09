import {Component, Input, OnInit} from '@angular/core';
import {LabelType, Options} from 'ng5-slider';
import {FireService} from '../../../services/fire/fire.service';
import {MapService} from '../../../services/map/map.service';

@Component({
  selector: 'date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.css']
})
export class DateSliderComponent implements OnInit {
  @Input() dates;

  constructor(private fireService: FireService, private mapService: MapService) {
  }

  ngOnInit() {
  }

  getOption = () => {
    const options: Options = {
      stepsArray: this.dates.map((date: Date) => {
        return {value: date.getTime()};
      }),
      translate: (value: number, label: LabelType): string => {
        return new Date(value).toDateString();
      },
      showTicks: true
    };
    return options;
  };
  getValue = () => {
    return this.dates[0].getTime();
  }
}
