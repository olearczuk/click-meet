import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { environment } from "../environments/environment";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(private http: HttpClient) { }

  private formatErrors(error: any) {
    return  throwError(error.error);
  }

  get(url: string, parameters: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(url, { params: parameters })
                    .pipe(catchError(this.formatErrors));
  }

  put(url: string, body: Object = {}): Observable<any> {
    return this.http.put(url, JSON.stringify(body))
                    .pipe(catchError(this.formatErrors));
  }

  post(url: string, body: Object = {}): Observable<any> {
    return this.http.post(url, JSON.stringify(body))
                    .pipe(catchError(this.formatErrors));
  }

  delete(url: string): Observable<any> {
    return this.http.delete(url)
                    .pipe(catchError(this.formatErrors));
  }
}
