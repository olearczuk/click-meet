import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  public currentUser : User;

  constructor(private userService: UserService) {}


  ngOnInit() {
    this.userService.updateLogin();

    this.userService.currentUser.subscribe(user => {
      this.currentUser = user;
    })
  }
}
