/**
 * @Summary: Time chart that can be used to select time range.
 *
 * @Author: (Hugo) Qiaonan Huang, Yang Cao
 *
 * Last modified  : 2019-08-27 15:31:40
 */

import {Component, Input, OnInit} from '@angular/core';

import {MapService} from '../../../services/map/map.service';
import {TimeService} from '../../../services/time/time.service';

import * as HighCharts from 'highcharts/highstock';
import {TweetService} from '../../../services/tweet/tweet.service';
import {TweetCount} from '../../../models/tweet.model';

@Component({
  selector: 'app-time-bar',
  templateUrl: './time-bar.component.html',
  styleUrls: ['./time-bar.component.css']
})
export class TimeBarComponent implements OnInit {
  @Input() start: string;
  @Input() end: string;
  private currentTick = undefined;
  private hasPlotBand = false;
  private timeBar = undefined;

  constructor(private mapService: MapService, private timeService: TimeService, private tweetService: TweetService) {

  }

  ngOnInit() {
    /** Subscribe tweet data related to wildfire in service. */
    this.tweetService.getTweetCountByDateData().subscribe(this.drawTimeBar);
  }

  /**
   * Using tweet data to draw a time bar reflecting daily tweet information
   *
   * Get data from backend and do the data retrieval of time to a specific date.
   * Count wildfire related tweets and draw it as a time bar chart to visualize.
   *
   */
  drawTimeBar = (tweetCounts: TweetCount[]) => {
    /** replace */
    /**
     *  Refine tweet data to count related to 'wildfire' in each DAY,
     *  storing in charData.
     */

    const data = [];
    tweetCounts.forEach(tweetCount => {
      data.push([tweetCount.date.getTime(), tweetCount.count]);
    });

    this.timeBar = HighCharts.stockChart('timeBar-container', {
      chart: {
        height: 150,
        backgroundColor: undefined,
        zoomType: 'x',
        events: {
          click: this.clickHandler
        }
      },
      navigator: {
        margin: 2,
        height: 30,
      },
      series: [{
        name: 'fire tweets',
        type: 'line',
        data,
        color: '#e25822',
      }],
      tooltip: {
        enabled: true,
        backgroundColor: 'white',
        padding: 0,
        hideDelay: 0,
        style: {
          color: '#e25822',
        }
      },
      rangeSelector: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        range: this.timeService.getRangeDate().reduce((p, c) => c - p),
        events: {
          setExtremes: this.setExtremeHandler
        }
      },
      scrollbar: {
        height: 0,
      },
    });
  };

  /**
   * Perform actions related to clicking event of time bar
   * And inform other components about this event
   *
   *  Tow things to check on a click event:
   *  1. Plot band: transparent orange box drew on time-bar.
   *  2. Ticks (x-axis label): color the x-axis if it is labeled.
   *
   * @param event event data triggered by the clicking event
   *
   */
  clickHandler = (event) => {
    const [leftBandStart, bandCenter, rightBandEnd, tick] = this.closestTickNearClick(event.xAxis[0]);
    const dateSelectedInYMD = new Date(bandCenter).toISOString().substring(0, 10);
    const plotBandOption = {
      from: leftBandStart,
      to: rightBandEnd,
      color: 'rgba(216,128,64)',
      id: 'plot-band'
    };

    if (!this.hasPlotBand) {
      this.timeBar.xAxis[0].addPlotBand(plotBandOption);
      if (tick !== undefined) {
        tick.label.css({
          color: '#ffffff'
        });
      }
      this.currentTick = tick;
      this.hasPlotBand = true;
      this.timeService.setCurrentDate(dateSelectedInYMD);
    } else if (dateSelectedInYMD !== this.timeService.getCurrentDate()) {
      this.timeBar.xAxis[0].removePlotBand('plotBand');
      this.timeBar.xAxis[0].addPlotBand(plotBandOption);
      if (this.currentTick !== undefined && this.currentTick.hasOwnProperty('label')) {
        this.currentTick.label.css({
          color: '#666666'
        });
      }
      if (tick !== undefined) {
        tick.label.css({
          color: '#ffffff'
        });
      }
      this.currentTick = tick;
      this.timeService.setCurrentDate(dateSelectedInYMD);
    } else {
      this.timeBar.xAxis[0].removePlotBand('plot-band');
      if (this.currentTick !== undefined && this.currentTick.hasOwnProperty('label')) {
        this.currentTick.label.css({
          color: '#666666'
        });
      }
      this.currentTick = undefined;
      this.hasPlotBand = false;
      this.timeService.setCurrentDate(undefined);
      this.timeService.sendTimeRange();
    }

  };

  /**
   *  This event allow both selections on time-bar and navigator,
   *  updating information of date.
   *
   *
   *  @param event event data triggered by the set range event of lower time bar
   *
   */
  setExtremeHandler = (event) => {
    this.timeService.setRangeDate(event.min, event.max);
    this.start = HighCharts.dateFormat('%Y-%m-%d', event.min);
    this.end = HighCharts.dateFormat('%Y-%m-%d', event.max);
    this.timeService.sendTimeRange();
  };

  /**
   *  Summary: Generate information needed for click event.
   *
   *  Description: Receive a event axis with click value to measure the distance on time bar.
   *
   *  @param eventAxis Click event fire information of axis.
   *
   *  @return [leftBandStart, bandCenter, rightBandEnd, tick] which will be used in
   *  time bar click event.
   */
  closestTickNearClick(eventAxis): [number, number, number, any] {

    const xAxis = eventAxis.axis;
    const halfUnitDistance = xAxis.closestPointRange / 2;
    const dateClickedInMs = eventAxis.value;
    let distanceToTheLeft;
    let distanceToTheRight;
    let minValue;
    let minKey;
    if (xAxis.ordinalPositions === undefined) {
      /** Ticks evenly distributed with unit distance 43200000*2. */
      minValue = dateClickedInMs - dateClickedInMs % halfUnitDistance;
      minValue += minValue % (halfUnitDistance * 2);
      distanceToTheLeft = halfUnitDistance;
      distanceToTheRight = halfUnitDistance;
    } else {
      /** Ticks distributed with different distance. */
      xAxis.ordinalPositions.forEach((value, index) => {
        if (minValue === undefined || Math.abs(dateClickedInMs - value) < Math.abs(dateClickedInMs - minValue)) {
          minValue = value;
          minKey = index;
        }
      });

      // FIX: variable might not be initialized
      if (minKey === 0 || minKey === xAxis.ordinalPositions.length - 1) {
        /** Case when click at the beginning or the end of the range. */
        distanceToTheLeft = 0;
        distanceToTheRight = 0;
      } else {
        distanceToTheLeft = (xAxis.ordinalPositions[minKey] - xAxis.ordinalPositions[minKey - 1]) / 2;
        distanceToTheRight = (xAxis.ordinalPositions[minKey + 1] - xAxis.ordinalPositions[minKey]) / 2;
      }
    }

    this.timeService.setRangeDate(minValue, (2 * distanceToTheRight) + minValue);
    this.start = HighCharts.dateFormat('%Y-%m-%d', minValue);
    this.end = HighCharts.dateFormat('%Y-%m-%d', 2 * distanceToTheRight + minValue);
    this.timeService.sendTimeRange();
    return [minValue - distanceToTheLeft, minValue, distanceToTheRight + minValue, xAxis.ticks[minValue]];
  }
}
