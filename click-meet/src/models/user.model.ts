export class User {
  id: number;
  username: string;
  password: string;
  email: string;
  professor: boolean;

  constructor(id: number, username: string, password: string, email: string, professor: boolean) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.professor = professor;
  }
}
