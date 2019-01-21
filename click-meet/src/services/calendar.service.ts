import { Injectable } from '@angular/core';
import { DAYS, CalendarConfig } from "../models/helpers/calendarconfig.model";
import { Action } from "../models/helpers/availabilityaction.model";
import {SelectionService} from "./selection.service";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  calendarConfig: CalendarConfig;
  action: Action;
  currentDateSubject: BehaviorSubject<Date>;
  currentDate: Observable<Date>;

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
    this.currentDateSubject = new BehaviorSubject<Date>(this.getWeekStart());
    this.currentDate = this.currentDateSubject.asObservable();

    this.action = new Action();
  }

  mouseDownEvent(e, i, j, notAvailable) {
    if (!this.action.adding && !this.action.removing && !this.action.marking && !this.action.searchingTime) {
      return;
    }

    e.preventDefault();
    this.selectionService.initSelection(i, j, (this.marking() || this.deleting()) && notAvailable);
  }

  mouseUpEvent(e, i, j) {
    e.preventDefault();
    this.selectionService.finishSelection(i, j);
  }

  mouseOverEvent(e, i, j, notAvailable) {
    e.preventDefault();
    this.selectionService.updateSelection(i, j,
      (this.marking() || this.deleting()) && notAvailable);
  }

  formatTime(mins) {
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;
    let h = (hours < 10) ? '0' + hours.toString() : hours;
    let m = (minutes < 10) ? '0' + minutes.toString() : minutes;
    return `${h}:${m}`;
  }

  getWeekStart() {
    let date = new Date();
    let day = date.getDay();
    let newDate = date.getDate() - day + (day == 0 ? -6 : 1);

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), newDate));
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
    this.action.deleting = false;
    this.action.marking = false;
    this.action.interestupdating = false;
    this.action.searchingTime = false;
    this.selectionService.resetSelection();
  }

  canCancel() {
    return this.adding() || this.removing() || this.deleting() || this.marking() || this.searchingTime();
  }

  removing() {
    return this.action.removing;
  }

  cantRemoving() {
    return this.adding() || this.interestupdating() || this.marking() || this.deleting();
  }

  setRemoving(val) {
    this.action.removing = val;
  }

  adding() {
    return this.action.adding;
  }

  cantAdding() {
    return this.removing() || this.interestupdating() || this.marking() || this.deleting();
  }

  setAdding(val) {
    this.action.adding = val;
  }

  interestupdating() {
    return this.action.interestupdating
  }

  cantInterestUpdating() {
    return this.adding() || this.removing() || this.marking() || this.deleting();
  }

  setInterestupdating(val) {
    this.action.interestupdating = val;
  }

  marking() {
    return this.action.marking;
  }

  cantMarking() {
    return this.adding() || this.removing() || this.interestupdating() || this.deleting();
  }

  setMarking(val) {
    this.action.marking = val;
  }

  deleting() {
    return this.action.deleting;
  }

  cantDeleting() {
    return this.adding() || this.removing() || this.interestupdating() || this.marking();
  }

  setDeleting(val) {
    this.action.deleting = val;
  }

  searchingTime() {
    return this.action.searchingTime;
  }

  setSearchingTime(val) {
    this.action.searchingTime = val;
  }

  searchingInterest() {
    return this.action.searchingInterest;
  }

  setSearchingInterest(val) {
    this.action.searchingInterest = val;
  }

  searchingTopic() {
    return this.action.searchingTopic;
  }

  setSearchingTopic(val) {
    this.action.searchingTopic = val;
  }

  cancelSearchInterest() {
    this.action.searchingInterest = false;
    this.action.searchingTime = false;
    this.action.searchingTopic = false;
    this.resetMessage();
    this.selectionService.resetSelection();
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

  getDateStart() {
    return this.currentDateSubject.getValue().toLocaleDateString();
  }

  getDateEnd() {
    let date = this.addDays(this.days().length - 1);
    return date.toLocaleDateString();
  }

  addDays(number) {
    let date = new Date(this.currentDateSubject.getValue());
    date.setDate(date.getDate() + number);
    return date;
  }

  calendarStart() {
    return this.currentDateSubject.getValue();
  }

  calendarEnd() {
    let date = this.addDays(this.days().length);
    date.setMilliseconds(-1);
    return date;
  }

  previousWeek() {
    this.currentDateSubject.next(this.addDays(-7));
  }

  nextWeek() {
    this.currentDateSubject.next(this.addDays(7));
  }
}
