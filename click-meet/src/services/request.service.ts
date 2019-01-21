import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  };

  private formatErrors(error: any) {
    let err = error.error;
    error.error.status = error.status;
   return  throwError(error.error);
  }

  get(url: string, parameters: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(url, { params: parameters, withCredentials: true, headers: this.headers })
                    .pipe(catchError(this.formatErrors));
  }

  put(url: string, body: Object = {}): Observable<any> {
    return this.http.put(url, JSON.stringify(body), { withCredentials: true, headers: this.headers })
                    .pipe(catchError(this.formatErrors));
  }

  post(url: string, body: Object = {}): Observable<any> {
    return this.http.post(url, JSON.stringify(body), { withCredentials: true, headers: this.headers })
                    .pipe(catchError(this.formatErrors));
  }

  delete(url: string, body: Object = {}): Observable<any> {
    return this.http.request('DELETE', url, { withCredentials: true, headers: this.headers, body: JSON.stringify(body) })
                    .pipe(catchError(this.formatErrors));
  }
}
