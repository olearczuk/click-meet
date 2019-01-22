import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";
import {ReservationService} from "../../services/reservation.service";
import {Reservation} from "../../models/reservation.model";
import {CalendarService} from "../../services/calendar.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  @Input()
  currentUser: User;
  errorMessage: string;
  reservations: Reservation[];

  constructor(private userService: UserService, private reservationsService: ReservationService,
              private calendarService: CalendarService) {
    this.errorMessage = '';
  }

  ngOnInit() {
    this.reservationsService.currentReservationsFlat.subscribe(res => {
      if (res) {
        this.reservations = res.filter(reservation => !!reservation.studentId).sort((a, b) => {
          return a.startTime - b.startTime;
        });
      }
    });
  }

  logout() {
    this.userService.logout().subscribe(() => {}, error => {
      this.errorMessage = error.message;
    });
    return false;
  }
}
