import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {Interest} from "../models/interest.model";
import {RequestService} from "./request.service";
import {CalendarService} from "./calendar.service";
import {UserService} from "./user.service";
import {BehaviorSubject} from "rxjs";
import {Availability} from "../models/availability.model";

@Injectable({
  providedIn: 'root'
})
export class InterestsService {
  private interestsApiPaths = {
    add : '/',
    delete: '/',
    getAll: '/',
    getProfessorInterests: '/professor/',
    getInterestsProfessors: '/'
  };

  private currentInterestsSubject: BehaviorSubject<Interest[]>;
  public currentInterests;

  constructor(private requestService: RequestService, private calendarService: CalendarService,
              private userService: UserService) {
    this.currentInterestsSubject = new BehaviorSubject<Interest[]>(null);
    this.currentInterests = this.currentInterestsSubject.asObservable();
  }

  addInterest(interest: Interest) {
    return this.requestService.post(environment.interestsApiUrl + this.interestsApiPaths.add, interest)
      .pipe(map(
        data => {
          interest.id = data.id;
          this.currentInterestsSubject.next(this.currentInterestsSubject.getValue().concat(interest));
          return data;
        }
      ));
  }

  getAllInterests() {
    return this.requestService.get(environment.interestsApiUrl + this.interestsApiPaths.getAll)
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  getProfessorsInterests(user: User) {
    return this.requestService.get(environment.interestsApiUrl + this.interestsApiPaths.getProfessorInterests + user.id)
      .pipe(map(
        data => {
          this.currentInterestsSubject.next(data.interests as Interest[]);
          return data;
        }
      ));
  }

  searchProfessors(interest: Interest) {
    return this.requestService.get(environment.interestsApiUrl + this.interestsApiPaths.getInterestsProfessors + interest.id)
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  deleteInterest(interest: Interest) {
    return this.requestService.delete(environment.interestsApiUrl + this.interestsApiPaths.delete + interest.id)
      .pipe(map(
        data => {
          this.currentInterestsSubject.next(this.currentInterestsSubject.getValue().filter(int => int.id !== interest.id));
          return data;
        }
      ));
  }

  changeInterest() {
    if (this.calendarService.removing() || this.calendarService.adding()) {
      return;
    }

    if (!this.calendarService.interestupdating()) {
      this.calendarService.setInterestupdating(true);
      this.calendarService.resetMessage();
      return;
    }

    this.calendarService.setInterestupdating(false);
  }

  removeInterest(interest: Interest) {
    this.calendarService.resetMessage();

    this.deleteInterest(interest).subscribe(x => {
      this.calendarService.setSuccess(true, "Successfully deleted interest");
    }, err => {
      this.calendarService.setError(true, err.message);
    });
  }

  pushInterest(value) {
    this.calendarService.resetMessage();

    let interest = new Interest();
    interest.title = value;

    this.addInterest(interest).subscribe(x => {
      this.calendarService.setSuccess(true, "Successfully added interest");
    }, err => {
      this.calendarService.setError(true, err.message);
    });
  }
}
