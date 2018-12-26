import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit {
  registerUserFormModel: User;
  submitted: boolean;
  errorMessage: string;

  constructor(private userService: UserService) {
    this.registerUserFormModel = new User(0, '', '', '', false);
    this.submitted = false;
    this.errorMessage = '';
  }

  ngOnInit() {
    this.userService.updateLogin().subscribe();
  }

  onSubmit() {
    this.userService.register(this.registerUserFormModel).subscribe(() => {
      this.submitted = true;
    }, error => {
      this.errorMessage = error.message;
    });
  }
}
