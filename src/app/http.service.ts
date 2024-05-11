import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient ) { }


  getAllButtons(): Observable<string>{
    return this.http.get<string>(`${this.baseUrl}/test`);
  }
}
