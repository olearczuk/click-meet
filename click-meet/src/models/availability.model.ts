import {User} from "./user.model";

export interface Availability {
  id: number;
  day: number;
  start_hour: number;
  end_hour: number;
  professor: User;
}
