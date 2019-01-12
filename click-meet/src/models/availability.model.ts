import {User} from "./user.model";

export class Availability {
  _id: number;
  day: number;
  start_hour: number;
  end_hour: number;
  professorId: string;
}
