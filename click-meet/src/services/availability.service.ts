import { Injectable } from '@angular/core';
import {RequestService} from "./request.service";
import {BehaviorSubject} from "rxjs";
import {User} from "../models/user.model";
import {Availability} from "../models/availability.model";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {CalendarService} from "./calendar.service";
import {SelectionService} from "./selection.service";

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
        console.log(this.processAvailabilities(null, data.availability));
        this.currentAvailabilitiesSubject.next(this.processAvailabilities(null, data.availability) as Availability[][]);
        return data;
      }));
  }

  createAvailability(availability: Availability) {
    return this.requestService.put(environment.availabilityApiUrl + this.availabilityApiPaths.createAvailability, availability).
      pipe(map(data => {
        this.currentAvailabilitiesSubject.next(this.processAvailabilities(this.currentAvailabilitiesSubject.getValue(), [data.availability]) as Availability[]);
        return data;
      }));
  }

  deleteAvailabilities(availabilities: Availability[]) {
    return this.requestService.delete(environment.availabilityApiUrl + this.availabilityApiPaths.deleteAvailability, availabilities.map(x => x._id)).
      pipe(map(data => {
        this.currentAvailabilitiesSubject.next(this.currentAvailabilitiesSubject.getValue());
        return data;
      }));
  }

  getProfessors() {

  }

  addAvailability() {
    if (this.calendarService.removing()) {
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
    if (this.calendarService.adding()) {
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

    this.deleteAvailabilities(availabilities).subscribe(data => {
      this.calendarService.setSuccess(true, "Successfully created availability");
    }, error => {
      this.calendarService.setError(true, error.message);
    });

    if (first_start_hour < first_end_hour) {
      let availability = new Availability();
      availability.day = this.selectionService.startColumn();
      availability.start_hour = first_start_hour;
      availability.end_hour = first_end_hour;
      this.createAvailability(availability).subscribe(() => {}, error => {
        this.calendarService.setError(true, error.message);
      });
    }

    if (second_start_hour < second_end_hour) {
      let availability = new Availability();
      availability.day = this.selectionService.startColumn();
      availability.start_hour = second_start_hour;
      availability.end_hour = second_end_hour;
      this.createAvailability(availability).subscribe(() => {}, error => {
        this.calendarService.setError(true, error.message);
      });
    }

    this.calendarService.setRemoving(false);
    this.selectionService.resetSelection();
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

  processAvailabilities(availabilities, data: Availability[]) {
    for (let availability of data) {
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

    return availabilities;
  }
}
