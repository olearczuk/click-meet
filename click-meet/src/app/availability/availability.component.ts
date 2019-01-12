import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {AvailabilityService} from "../../services/availability.service";
import {Availability} from "../../models/availability.model";
import {CalendarService} from "../../services/calendar.service";
import {SelectionService} from "../../services/selection.service";

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.less']
})
export class AvailabilityComponent implements OnInit {
  @Input()
  currentUser: User;
  currentAvailabilities: Availability[][];

  constructor(public availabilityService: AvailabilityService, public calendarService: CalendarService,
              public selectionService: SelectionService) {}


  ngOnInit() {
    this.availabilityService.getAvailability(this.currentUser).subscribe(() => {});
    this.availabilityService.currentAvailabilities.subscribe(availabilities => {
      this.currentAvailabilities = availabilities;
    });
  }
}
