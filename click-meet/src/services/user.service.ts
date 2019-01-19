import { Injectable } from '@angular/core';
import {RequestService} from "./request.service";
import {BehaviorSubject} from "rxjs";
import {User} from "../models/user.model";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject;
  private userApiPaths = {
    register : '/register',
    login: '/login',
    logout: '/logout'
  };
  public currentUser;

  constructor(private requestService: RequestService) {
    this.currentUserSubject = new BehaviorSubject<User>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  register(user: User) {
    return this.requestService.post(environment.userApiUrl + this.userApiPaths.register, user)
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  login(user: User) {
    return this.requestService.post(environment.userApiUrl + this.userApiPaths.login, user)
      .pipe(map(
        data => {
          this.currentUserSubject.next(data as User);
          return data;
        }
      ));
  }

  updateLogin() {
    this.requestService.get(environment.userApiUrl + this.userApiPaths.login)
      .subscribe((data) => {
        this.currentUserSubject.next(data as User);
      }, err => {
        if (err.status === 403) {
            this.currentUserSubject.next({} as User);
        }
    });
  }

  logout() {
    return this.requestService.post(environment.userApiUrl + this.userApiPaths.logout)
      .pipe(map(
        data => {
          this.currentUserSubject.next({} as User);
          return data;
        }
      ));
  }
}
