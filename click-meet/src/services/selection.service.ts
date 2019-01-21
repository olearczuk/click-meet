import { Injectable } from '@angular/core';
import { Selection } from "../models/helpers/selection.model";
import {CalendarService} from "./calendar.service";
import {AvailabilityService} from "./availability.service";
import {Reservation} from "../models/reservation.model";

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private _selection: Selection;
  public selectedReservation: Reservation;

  constructor() {
    this._selection = new Selection();
    this.selectedReservation = null;
  }

  initSelection(i: number, j: number, notAvailable: boolean) {
    if (notAvailable) {
      return;
    }

    this._selection.startRow = i;
    this._selection.startColumn = j;
    this._selection.endRow = i;
    this._selection.endColumn = j;
    this._selection.selecting = true;
  }

  updateSelection(i: number, j: number, notAvailable: boolean) {
    if (!this.selecting() || this.startColumn() !== j || notAvailable) {
      return;
    }

    this._selection.endRow = i;
    this._selection.endColumn = j;
  }

  checkForSelection(i: number, j: number) {
    let startRow = Math.min(this._selection.startRow, this._selection.endRow);
    let endRow = Math.max(this._selection.startRow, this._selection.endRow);

    let startColumn = Math.min(this._selection.startColumn, this._selection.endColumn);
    let endColumn = Math.max(this._selection.startColumn, this._selection.endColumn);
    return startRow <= i && i <= endRow && startColumn <= j && j <= endColumn;
  }

  finishSelection(i: number, j: number) {
    if (!this.selecting()) {
      return;
    }

    this._selection.selecting = false;

    let startRow = Math.min(this._selection.startRow, this._selection.endRow);
    let endRow = Math.max(this._selection.startRow, this._selection.endRow);

    let startColumn = Math.min(this._selection.startColumn, this._selection.endColumn);
    let endColumn = Math.max(this._selection.startColumn, this._selection.endColumn);

    this._selection.startRow = startRow;
    this._selection.startColumn = startColumn;
    this._selection.endRow = endRow;
    this._selection.endColumn = endColumn;
  }

  resetSelection() {
    this._selection.startRow = -1;
    this._selection.startColumn = -1;
    this._selection.endRow = -1;
    this._selection.endColumn = -1;
    this.selectedReservation = null;
  }

  selecting() {
    return this._selection.selecting;
  }

  startRow() {
    return this._selection.startRow;
  }

  startColumn() {
    return this._selection.startColumn;
  }

  endRow() {
    return this._selection.endRow;
  }

  endColumn() {
    return this._selection.endColumn;
  }
}
