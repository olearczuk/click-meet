import { Injectable } from '@angular/core';
import {Reservation} from "../models/reservation.model";
import {RequestService} from "./request.service";
import {environment} from "../environments/environment";
import {concatAll, concatMap, exhaustMap, flatMap, map, mergeMap} from "rxjs/operators";
import {User} from "../models/user.model";
import {HttpParams} from "@angular/common/http";
import {CalendarService} from "./calendar.service";
import {SelectionService} from "./selection.service";
import {BehaviorSubject, concat, forkJoin, of} from "rxjs";
import {Availability} from "../models/availability.model";
import {AvailabilityService} from "./availability.service";
import {InterestsService} from "./interests.service";
import {Interest} from "../models/interest.model";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reversationsApiPaths = {
    addMeeting : '/student',
    addBusy: '/professor',
    reservationInfo: '/',
    reservationDelete: '/',
    professorReservations: '/professor/',
    myReservations: '/reservations/personal',
    busyProfessors: '/'
  };
  private currentReservationsSubjectFlat;
  public currentReservationsFlat;

  private currentReservationsSubject;
  public currentReservations;
  private newReservation;
  public foundProfessors;

  constructor(private requestService: RequestService, private calendarService: CalendarService,
              private selectionService: SelectionService, private availabilityService: AvailabilityService,
              private interestService: InterestsService, private userService: UserService) {

    this.currentReservationsSubjectFlat = new BehaviorSubject<Reservation[]>(null);
    this.currentReservationsFlat = this.currentReservationsSubjectFlat.asObservable();

    this.currentReservationsSubject = new BehaviorSubject<Reservation[][]>(null);
    this.currentReservations = this.currentReservationsSubject.asObservable();

    this.calendarService.currentDate.subscribe(() => {
      this.getMyReservations(calendarService.calendarStart(), this.calendarService.calendarEnd()).subscribe();
    })
  }

  addReservation(reservation: Reservation) {
    return this.requestService.put(environment.reservationsApiUrl + this.reversationsApiPaths.addMeeting, reservation)
      .pipe(map(
        data => {
          reservation.id = data.id;
          this.currentReservationsSubjectFlat.next(this.currentReservationsSubjectFlat.getValue().concat(reservation));
          this.currentReservationsSubject.next(this.processReservations(this.currentReservationsSubject.getValue(),
            [reservation], []));

          return data;
        }
      ));
  }

  addBusy(reservation: Reservation) {
    return this.requestService.put(environment.reservationsApiUrl + this.reversationsApiPaths.addBusy, reservation)
      .pipe(map(
        data => {
          reservation.id = data.id;
          this.currentReservationsSubjectFlat.next(this.currentReservationsSubjectFlat.getValue().concat(reservation));
          this.currentReservationsSubject.next(this.processReservations(this.currentReservationsSubject.getValue(),
                                                                  [reservation], []));
          return data;
        }
      ));
  }

  reservationInfo(reservation: Reservation) {
    return this.requestService.get(environment.reservationsApiUrl + this.reversationsApiPaths.reservationInfo + reservation.id)
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  deleteReservation(reservation: Reservation) {
    return this.requestService.delete(environment.reservationsApiUrl + this.reversationsApiPaths.reservationDelete + reservation.id)
      .pipe(map(
        data => {
          this.currentReservationsSubjectFlat.next(this.currentReservationsSubjectFlat.getValue().filter(res => res.id !== reservation.id));
          this.currentReservationsSubject.next(this.processReservations(this.currentReservationsSubject.getValue(),
            [], [reservation]));
          return data;
        }
      ));
  }

  getProfessorReservations(user: User) {
    return this.requestService.get(environment.reservationsApiUrl + this.reversationsApiPaths.professorReservations + user.id)
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  getMyReservations(startTime: Date, endTime: Date) {
    return this.requestService.get(environment.reservationsApiUrl + this.reversationsApiPaths.myReservations,
      new HttpParams().set("startTime", startTime.toISOString()).set("endTime", endTime.toISOString()))
      .pipe(map(
        data => {
          for (let reservation of data.reservations) {
            reservation.startTime = new Date(Date.parse(reservation.startTime));
            reservation.endTime = new Date(Date.parse(reservation.endTime));
            reservation.id = reservation._id;
          }

          this.currentReservationsSubjectFlat.next(data.reservations);
          this.currentReservationsSubject.next(this.processReservations(null, data.reservations, []));
          return data;
        }
      ));
  }

  getBusyProfessors(startTime: Date, endTime: Date) {
    return this.requestService.get(environment.reservationsApiUrl + this.reversationsApiPaths.busyProfessors,
      new HttpParams().set("startTime", startTime.toISOString()).set("endTime", endTime.toISOString()))
      .pipe(map(
        data => {
          return data.professors;
        }
      ));
  }

  processReservations(reservations: Reservation[][], toAdd : Reservation[], toRemove: Reservation[]) {
    for (let reservation of toAdd) {
      let column = reservation.startTime.getDay() - 1;
      let rowStart = (60 * reservation.startTime.getUTCHours() + reservation.startTime.getUTCMinutes() - this.calendarService.start_hour()) /
        this.calendarService.interval();
      let rowEnd = (60 * reservation.endTime.getUTCHours() + reservation.endTime.getUTCMinutes() - this.calendarService.start_hour()) /
        this.calendarService.interval();

      for (let row = rowStart; row < rowEnd; row += 1) {
        if (!reservations) {
          reservations = [];
        }

        if (!reservations[row]) {
          reservations[row] = [];
        }

        reservations[row][column] = reservation;
      }
    }

    for (let reservation of toRemove) {
      let column = reservation.startTime.getDay() - 1;
      let rowStart = (60 * reservation.startTime.getUTCHours() + reservation.startTime.getUTCMinutes() - this.calendarService.start_hour()) /
        this.calendarService.interval();
      let rowEnd = (60 * reservation.endTime.getUTCHours() + reservation.endTime.getUTCMinutes() - this.calendarService.start_hour()) /
        this.calendarService.interval();

      for (let row = rowStart; row < rowEnd; row += 1) {
        reservations[row][column] = null;
      }
    }

    return reservations;
  }

  reservationExists(i, j) {
    let val = this.currentReservationsSubject.getValue();
    return val && val[i] && val[i][j]
  }

  reservationBusy(i, j) {
    let val = this.currentReservationsSubject.getValue()[i][j];
    return !val.studentId;
  }

  reservationSelected(i, j) {
    let val = this.currentReservationsSubject.getValue()[i][j];
    return this.selectionService.selectedReservation && this.selectionService.selectedReservation.id === val.id;
  }

  reservationStart(i, j) {
    let val = this.currentReservationsSubject.getValue();
    return this.reservationExists(i, j) && (!this.reservationExists(i - 1, j) || val[i][j].id !== val[i-1][j].id);
  }

  reservationRowspan(i, j) {
    let val = this.currentReservationsSubject.getValue()[i][j];
    let rowStart = (60 * val.startTime.getUTCHours() + val.startTime.getUTCMinutes() - this.calendarService.start_hour()) /
      this.calendarService.interval();
    let rowEnd = (60 * val.endTime.getUTCHours() + val.endTime.getUTCMinutes() - this.calendarService.start_hour()) /
      this.calendarService.interval();

    return rowEnd - rowStart;
  }

  getTopic(i, j) {
    return  this.currentReservationsSubject.getValue()[i][j].topic;
  }

  markBusy() {
    if (this.calendarService.cantMarking()) {
      return;
    }

    if (!this.calendarService.marking()) {
      this.calendarService.setMarking(true);
      this.calendarService.resetMessage();
      return;
    }

    let day = this.selectionService.startColumn();
    let startHour = this.calendarService.time(this.selectionService.startRow());
    let endHour = this.calendarService.time(this.selectionService.endRow()) + this.calendarService.interval();

    let startDate = this.calendarService.addDays(day);
    let endDate = this.calendarService.addDays(day);
    startDate.setHours(startHour/ 60, startHour % 60, 0, 0);
    endDate.setHours(endHour / 60, endHour % 60, 0, 0);

    let res = new Reservation();
    res.startTime = new Date(Date.UTC(startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds(),
      startDate.getMilliseconds()));

    res.endTime = new Date(Date.UTC(endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
      endDate.getSeconds(),
      endDate.getMilliseconds()));

    this.addBusy(res).subscribe(resp => {
      this.calendarService.setSuccess(true, "Successfully marked as busy");
    }, err => {
      this.calendarService.setError(true, err.message);
    });

    this.calendarService.setMarking(false);
    this.selectionService.resetSelection();
  }

  selectForDelete(i, j) {
    if (!this.calendarService.deleting()) {
      return;
    }

    this.calendarService.resetMessage();
    this.selectionService.selectedReservation = this.currentReservationsSubject.getValue()[i][j];
  }

  deleteMeeting() {
    if (this.calendarService.cantDeleting()) {
      return;
    }

    if (!this.calendarService.deleting()) {
      this.calendarService.setDeleting(true);
      this.calendarService.resetMessage();
      return;
    }

    if (!this.selectionService.selectedReservation) {
      this.calendarService.setError(true, "You need to select something");
      return;
    }

    this.deleteReservation(this.selectionService.selectedReservation).subscribe(x => {
      this.calendarService.setSuccess(true, "Successfully deleted a reservation");
    }, error => {
      this.calendarService.setError(true, error.message);
    });

    this.calendarService.setDeleting(false);
    this.selectionService.resetSelection();
  }

  getInterests(prof) {
    return prof.interests.map(x => x.title).join(', ');
  }

  searchReservation(query = "") {
    if (!this.calendarService.searchingTime()) {
      this.newReservation = new Reservation();
      this.foundProfessors = null;

      this.calendarService.setSearchingTime(true);
      this.calendarService.resetMessage();
      return;
    }

    if (this.selectionService.startRow() === null || this.selectionService.startRow() === undefined ||
        this.selectionService.startRow() < 0) {
      this.calendarService.setError(true, "You need to select time interval!");
      return;
    }

    if (!this.calendarService.searchingInterest()) {
      this.calendarService.setSearchingInterest(true);
      this.calendarService.resetMessage();
      return;
    }

    if (!query) {
      this.calendarService.setError(true, "You need to enter something!");
      return;
    }
    this.calendarService.resetMessage();

    let availability = new Availability();
    availability.day = this.selectionService.startColumn();
    availability.start_hour = this.calendarService.time(this.selectionService.startRow());
    availability.end_hour = this.calendarService.time(this.selectionService.endRow()) + this.calendarService.interval();

    let interest = new Interest();
    interest.title = query;

    let startDate = this.calendarService.addDays(availability.day);
    let endDate = this.calendarService.addDays(availability.day);
    startDate.setHours(availability.start_hour/ 60, availability.start_hour % 60, 0, 0);
    endDate.setHours(availability.end_hour / 60, availability.end_hour % 60, 0, 0);

    let startTime = new Date(Date.UTC(startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds(),
      startDate.getMilliseconds()));

    let endTime = new Date(Date.UTC(endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
      endDate.getSeconds(),
      endDate.getMilliseconds()));

    this.newReservation.startTime = startTime;
    this.newReservation.endTime = endTime;

    forkJoin(
      this.availabilityService.getProfessors(availability),
      this.interestService.searchProfessors(interest),
      this.getBusyProfessors(startTime, endTime)
    ).pipe(map(resp => {
      return resp[0].filter(prof => resp[1].indexOf(prof) !== -1).filter(prof => resp[2].indexOf(prof) === -1).map(u => {
        return new User(u, 'a', 'a', 'a', true);
      });
    })).pipe(exhaustMap((users) => {
      if (users.length) {
        return forkJoin(
          this.interestService.searchProfessorsInterests(users),
          this.userService.getInformationAboutUsers(users))
      }
      else {
        return of([])
      }
    })).subscribe( resp => {
      if (resp.length) {
        this.foundProfessors = [resp[0], resp[1]].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
      } else {
        this.foundProfessors = [];
      }
    }, err => {
      this.calendarService.setError(true, err.message);
    });
  }

  arrangeMeeting(studId, profId, topic) {
    if (!this.calendarService.searchingTopic()) {
      this.newReservation.professorId = profId;
      this.newReservation.studentId = studId;
      this.calendarService.setSearchingTopic(true);
      this.calendarService.resetMessage();
      return;
    }
    this.newReservation.topic = topic;

    this.addReservation(this.newReservation).subscribe(resp => {
      this.calendarService.setSuccess(true, "Successfully added a meeting");
    }, err => {
      this.calendarService.setError(true, err.message);
    });
  }
}
