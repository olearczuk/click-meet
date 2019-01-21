import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {Availability} from "../../models/availability.model";
import {AvailabilityService} from "../../services/availability.service";
import {CalendarService} from "../../services/calendar.service";
import {SelectionService} from "../../services/selection.service";
import {InterestsService} from "../../services/interests.service";
import {Interest} from "../../models/interest.model";
import {ReservationService} from "../../services/reservation.service";
import {Reservation} from "../../models/reservation.model";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.less']
})
export class CalendarComponent implements OnInit {
  @Input()
  currentUser: User;
  currentAvailabilities: Availability[][];
  currentReservations: Reservation[][];
  currentInterests: Interest[];

  constructor(public availabilityService: AvailabilityService, public calendarService: CalendarService,
              public selectionService: SelectionService, public interestService: InterestsService,
              public reservationsService: ReservationService) {
  }

  ngOnInit() {
    this.availabilityService.getAvailability(this.currentUser).subscribe(() => {});
    this.reservationsService.getMyReservations(this.calendarService.calendarStart(),
      this.calendarService.calendarEnd()).subscribe(() => {});

    this.reservationsService.currentReservationsFlat.subscribe(() => {}, error => {
      console.log(error);
    });
    this.interestService.getProfessorsInterests(this.currentUser).subscribe(() => {});

    this.availabilityService.currentAvailabilities.subscribe(availabilities => {
      this.currentAvailabilities = availabilities;
    });
    this.reservationsService.currentReservations.subscribe(reservations => {
      this.currentReservations = reservations;
    }, error => {
      console.log(error);
    });
    this.interestService.currentInterests.subscribe(interests => {
      this.currentInterests = interests;
    })
  }
}
