export class CalendarConfig {
  days: DAYS[];
  interval: number;
  start_hour: number;
  end_hour: number;
  times: number[];

  constructor(days: DAYS[], interval: number, start_hour: number, end_hour: number, times: number[]) {
    this.days = days;
    this.interval = interval;
    this.start_hour = start_hour;
    this.end_hour = end_hour;
    this.times = times;
  }
}
export enum DAYS {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday"
}

