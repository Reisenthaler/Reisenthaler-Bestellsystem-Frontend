import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {HttpService} from "./http.service";
import {MatTabChangeEvent} from "@angular/material/tabs";



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Reisenthaler-Bestellsystem-Frontend';

  tischname: String = "";
  allButtons: any[] = [];
  currentButtons: any[] = [];
  einkaufswagen: any[] = [];
  einkaufswagentab: boolean = true;

  navigationItems = [
    {label: 'Bestellung', icon: 'home', route: '/Bestellung', id: 99999},
  ];
  totalPrice: any;




  constructor(private http: HttpClient, private httpService: HttpService, private route: ActivatedRoute ) {
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tischname = params['tischname'];
      console.log(this.tischname);

    });

      this.httpService.getAllButtons().subscribe(
        (data: any) => {
            this.allButtons = data;

            console.log("allbuttons");
            console.log(this.allButtons);

            this.addButtonsToNavBar(this.allButtons);

            this.httpService.startGettingUpdates();

            this.httpService.triggerUpdate$.subscribe(() => {
              this.handleUpdate();
            });
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  private handleUpdate() {

    this.httpService.getAllButtons().subscribe(
      (data: any) => {
        this.allButtons = data;
        console.log(this.allButtons);

        this.httpService.sentUpToDate();
      });


  }

  onTabChange(event: MatTabChangeEvent) {
    //console.log(event);

      this.einkaufswagentab = event.tab.textLabel === "99999";

    this.getCurrentButtons(event.tab.textLabel);
  }



  addButtonsToNavBar(allbuttons: any[])
  {
    allbuttons.forEach((button: any) => {
      if (button.kategorie === '')
      {
        this.navigationItems.push({label: button.name, icon: 'home', route: '/' + button.name, id: button.id});
      }
    });
  }

  getCurrentButtons(vorgaenger: any)
  {
    this.currentButtons.length = 0;

    this.allButtons.forEach((button: any) => {
      if (button.vorgaenger === vorgaenger)
      {
        this.currentButtons.push(button);
      }
    });
  }

  produktButtonClick(button: any)
  {

      if (button.preis !== '0.0')
      {
       this.addToEinkaufswagen(button);
      }
      else
      {
        this.getCurrentButtons(button.id);
      }
  }

  addToEinkaufswagen(button: any)
  {
    if (this.einkaufswagen.includes(button))
    {
      this.einkaufswagen[this.einkaufswagen.indexOf(button)].quantity++;
    }
    else
    {
      this.einkaufswagen.push(button);
    }
  }

  submitOrder() {
    console.log(this.einkaufswagen);
    this.httpService.sendData(this.einkaufswagen, this.tischname).subscribe(response => {
      console.log('Response:', response); // Log the response
    }, error => {
      console.error('Error:', error); // Log the error
    });

    this.einkaufswagen.length = 0;
  }

  addItem(i: number) {
    this.einkaufswagen[i].quantity++;
  }

  removeItem(i: number) {
    this.einkaufswagen[i].quantity--;
    if (this.einkaufswagen[i].quantity <= 0 )
    {
      this.einkaufswagen.splice(i,1);
    }
  }

}

