import { Injectable } from '@angular/core';
import { DAYS, CalendarConfig } from "../models/helpers/calendarconfig.model";
import { Action } from "../models/helpers/availabilityaction.model";
import {SelectionService} from "./selection.service";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  calendarConfig: CalendarConfig;
  action: Action;
  _interval: number = 30;
  _start_hour: number = 8 * 60;
  _end_hour: number = 19.5 * 60;

  constructor(private selectionService: SelectionService) {
    this.calendarConfig = new CalendarConfig(
      this.constructDays(),
      this._interval,
      this._start_hour,
      this._end_hour,
      this.constructTimes(this._start_hour, this._end_hour, this._interval));

    this.action = new Action();
  }

  mouseDownEvent(e, i, j) {
    if (!this.action.adding && !this.action.removing) {
      return;
    }

    e.preventDefault();
    this.selectionService.initSelection(i, j);
  }

  mouseUpEvent(e, i, j) {
    e.preventDefault();
    this.selectionService.finishSelection(i, j);
  }

  mouseOverEvent(e, i, j) {
    e.preventDefault();
    this.selectionService.updateSelection(i, j);
  }

  formatTime(mins) {
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;
    let h = (hours < 10) ? '0' + hours.toString() : hours;
    let m = (minutes < 10) ? '0' + minutes.toString() : minutes;
    return `${h}:${m}`;
  }

  constructDays() {
    return [DAYS.Monday, DAYS.Tuesday, DAYS.Wednesday, DAYS.Thursday, DAYS.Friday];
  }

  constructTimes(start_hour, end_hour, interval) {
    let times = [];
    for (let i = start_hour; i <= end_hour; i += interval) {
      times.push(i);
    }

    return times;
  }

  cancelAction() {
    this.action.adding = false;
    this.action.removing = false;
    this.selectionService.resetSelection();
  }

  removing() {
    return this.action.removing;
  }

  setRemoving(val) {
    this.action.removing = val;
  }

  adding() {
    return this.action.adding;
  }

  setAdding(val) {
    this.action.adding = val;
  }

  interestupdating() {
    return this.action.interestupdating
  }

  setInterestupdating(val) {
    this.action.interestupdating = val;
  }

  cancelInterestupdating() {
    this.action.interestupdating = false;
    this.resetMessage();
  }

  success() {
    return this.action.success;
  }

  setSuccess(val, message) {
    this.action.error = !val;
    this.action.success = val;
    this.action.message = message;
  }

  error() {
    return this.action.error;
  }

  setError(val, message) {
    this.action.success = !val;
    this.action.error = val;
    this.action.message = message;
  }

  message() {
    return this.action.message;
  }

  resetMessage() {
    this.action.message = "";
  }

  time(index) {
    return this.calendarConfig.times[index];
  }

  times() {
    return this.calendarConfig.times;
  }

  day(index) {
    return this.calendarConfig.days[index];
  }

  days() {
    return this.calendarConfig.days;
  }

  interval() {
    return this.calendarConfig.interval;
  }

  start_hour() {
    return this.calendarConfig.start_hour;
  }

  end_hour() {
    return this.calendarConfig.end_hour;
  }
}
