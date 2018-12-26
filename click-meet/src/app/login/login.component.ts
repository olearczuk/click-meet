import { Component, OnInit } from '@angular/core';
import { User } from "../../models/user.model";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
  userModel: User;
  errorMessage: string;

  constructor(private userService: UserService) {
    this.userModel = new User(0, '', '', '', false);
    this.errorMessage = '';
  }

  ngOnInit() {
  }

  onSubmit() {
    this.errorMessage = '';
    this.userService.login(this.userModel).subscribe(() => {}, error => {
      this.errorMessage = error.message;
    });
  }
}
