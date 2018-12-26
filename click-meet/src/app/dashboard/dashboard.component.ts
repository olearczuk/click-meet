import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  @Input()
  currentUser: User;
  errorMessage: string;

  constructor(private userService: UserService) {
    this.errorMessage = '';
  }

  ngOnInit() {
  }

  logout() {
    this.userService.logout().subscribe(() => {}, error => {
      this.errorMessage = error.message;
    });
  }
}
