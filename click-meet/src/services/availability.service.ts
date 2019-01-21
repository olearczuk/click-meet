import { Injectable } from '@angular/core';
import {RequestService} from "./request.service";
import {BehaviorSubject, forkJoin, of} from "rxjs";
import {User} from "../models/user.model";
import {Availability} from "../models/availability.model";
import {environment} from "../environments/environment";
import {map, flatMap, concat, merge} from "rxjs/operators";
import {CalendarService} from "./calendar.service";
import {SelectionService} from "./selection.service";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private currentAvailabilitiesSubject;
  private availabilityApiPaths = {
    getAvailability : '/professor/',
    getProfessors: '/',
    createAvailability: '/',
    deleteAvailability: '/'
  };
  public currentAvailabilities;

  constructor(private requestService: RequestService, private calendarService: CalendarService,
              private selectionService: SelectionService) {
    this.currentAvailabilitiesSubject = new BehaviorSubject<Availability[][]>(null);
    this.currentAvailabilities = this.currentAvailabilitiesSubject.asObservable();
  }

  getAvailability(user: User) {
    return this.requestService.get(environment.availabilityApiUrl + this.availabilityApiPaths.getAvailability + user.id).
      pipe(map(data => {
        this.currentAvailabilitiesSubject.next(this.processAvailabilities(null, data.availability, []) as Availability[][]);
        return data;
      }));
  }

  createAvailability(availability: Availability) {
    return this.requestService.put(environment.availabilityApiUrl + this.availabilityApiPaths.createAvailability, availability).
      pipe(map(data => {
        this.currentAvailabilitiesSubject.next(this.processAvailabilities(this.currentAvailabilitiesSubject.getValue(), [data.availability], []) as Availability[]);
        return data;
      }));
  }

  deleteAvailabilities(availabilities: Availability[]) {
    return this.requestService.delete(environment.availabilityApiUrl + this.availabilityApiPaths.deleteAvailability, { ids: availabilities.map(x => x._id)}).
      pipe(map(data => {
        this.currentAvailabilitiesSubject.next(this.processAvailabilities(this.currentAvailabilitiesSubject.getValue(), [], availabilities));
        return data;
      }));
  }

  getProfessors(availability: Availability) {
    return this.requestService.get(environment.availabilityApiUrl + this.availabilityApiPaths.getProfessors,
      new HttpParams().set('day', availability.day.toString()).set('start_hour', availability.start_hour.toString())
        .set('end_hour', availability.end_hour.toString())).
      pipe(map(data => {
        return data.professors;
      }));
  }

  addAvailability() {
    if (this.calendarService.cantAdding()) {
      return;
    }

    if (!this.calendarService.adding()) {
      this.calendarService.setAdding(true);
      this.calendarService.resetMessage();
      return;
    }

    this.createAvailability(this.calculateAvailability()).subscribe(data => {
      this.calendarService.setSuccess(true, "Successfully created availability");
    }, error => {
      this.calendarService.setError(true, error.message);
    });

    this.calendarService.setAdding(false);
    this.selectionService.resetSelection();
  }

  removeAvailability() {
    if (this.calendarService.cantRemoving()) {
      return;
    }

    if (!this.calendarService.removing()) {
      this.calendarService.setRemoving(true);
      this.calendarService.resetMessage();
      return;
    }

    let availabilities = this.availabilitiesInterval();

    let first_start_hour = Math.min(... availabilities.map(av => av.start_hour));
    let first_end_hour = this.calendarService.time(this.selectionService.startRow());
    let second_start_hour = this.calendarService.time(this.selectionService.endRow()) + this.calendarService.interval();
    let second_end_hour = Math.max(... availabilities.map(av => av.end_hour));

    this.deleteAvailabilities(availabilities).pipe(concat(
      this.addMissingAvailability(first_start_hour, first_end_hour)
    )).pipe(concat(
      this.addMissingAvailability(second_start_hour, second_end_hour)
    )).subscribe(() => {
      this.calendarService.setSuccess(true, "Successfully removed availability");
      this.calendarService.setRemoving(false);
      this.selectionService.resetSelection();
    }, error => {
      this.calendarService.setError(true, error.message);
      this.calendarService.setRemoving(false);
      this.selectionService.resetSelection();
    });
  }

  addMissingAvailability(start, end) {
    if (start < end) {
      let availability = new Availability();
      availability.day = this.selectionService.startColumn();
      availability.start_hour = start;
      availability.end_hour = end;

      return this.createAvailability(availability);
    }

    return of(null);
  }

  calculateAvailability() {
    let availability =  new Availability();
    availability.day = this.selectionService.startColumn();
    availability.start_hour = this.calendarService.time(this.selectionService.startRow());
    availability.end_hour = this.calendarService.time(this.selectionService.endRow()) + this.calendarService.interval();
    return availability;
  }

  availabilityExists(i, j) {
    let val = this.currentAvailabilitiesSubject.getValue();
    return val && val[i] && val[i][j]
  }

  availabilitiesInterval() {
    let startRow = this.selectionService.startRow();
    let endRow = this.selectionService.endRow();

    let startColumn = this.selectionService.startColumn();
    let endColumn = this.selectionService.endColumn();

    let availabilities = [];
    for (let i = startRow; i <= endRow; ++i) {
      for (let j = startColumn; j <= endColumn; ++j) {
        if (this.availabilityExists(i,j)) {
          availabilities.push(this.currentAvailabilitiesSubject.getValue()[i][j]);
        }
      }
    }
    return availabilities;
  }

  processAvailabilities(availabilities, dataToAdd: Availability[], dataToRemove) {
    for (let availability of dataToAdd) {
      let column = availability.day;
      let rowStart = (availability.start_hour - this.calendarService.start_hour()) /
                      this.calendarService.interval();
      let rowEnd = (availability.end_hour - this.calendarService.start_hour()) /
                      this.calendarService.interval();

      for (let row = rowStart; row < rowEnd; row += 1) {
        if (!availabilities) {
          availabilities = [];
        }

        if (!availabilities[row]) {
          availabilities[row] = [];
        }

        availabilities[row][column] = availability;
      }
    }

    for (let availability of dataToRemove) {
      let column = availability.day;
      let rowStart = (availability.start_hour - this.calendarService.start_hour()) /
        this.calendarService.interval();
      let rowEnd = (availability.end_hour - this.calendarService.start_hour()) /
        this.calendarService.interval();

      for (let row = rowStart; row < rowEnd; row += 1) {
        availabilities[row][column] = null;
      }
    }

    return availabilities;
  }
}
