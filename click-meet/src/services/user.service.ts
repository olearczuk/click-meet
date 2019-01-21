import { Injectable } from '@angular/core';
import {RequestService} from "./request.service";
import {BehaviorSubject} from "rxjs";
import {User} from "../models/user.model";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {Interest} from "../models/interest.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject;
  private userApiPaths = {
    register : '/register',
    login: '/login',
    logout: '/logout',
    info: '/info'
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

  getInformationAboutUsers(users: User[]) {
    let params = new HttpParams();
    users.forEach(u => {
      params = params.append('ids[]', u.id.toString());
    });

    return this.requestService.get(environment.userApiUrl + this.userApiPaths.info, params)
      .pipe(map(
        data => {
          return data;
        }
      ));
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
