import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {HttpService} from "./http.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Reisenthaler-Bestellsystem-Frontend';

  tischname: String = "";
  allbuttons: any[] = [];

  constructor(private http: HttpClient, private httpService: HttpService, private route: ActivatedRoute ) {
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tischname = params['tischname'];
      console.log(this.tischname);

    });
      this.httpService.getAllButtons().subscribe(
        (data: any) => {


          this.allbuttons = data;
          console.log("allbuttons");
          console.log(this.allbuttons);
        },
        (error) => {
          console.error('Error:', error);
        }
      );




}
}

