import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {HttpService} from "./http.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {MatDialog} from "@angular/material/dialog";
import {TextPopupComponent} from "./text-popup/text-popup.component";



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
  totalPrice: any;

  navigationItems = [
    {label: 'Bestellung', icon: 'home', route: '/Bestellung', id: 99999},
  ];





  constructor(private http: HttpClient, private httpService: HttpService, private route: ActivatedRoute, public dialog: MatDialog) {
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

        this.currentButtons.forEach((button: any) =>{
          if (!this.allButtons.includes(button))
          {
            this.currentButtons = this.currentButtons.filter(item => item !== button);
          }
        })

        this.httpService.sentUpToDate();
      });


  }

  onTabChange(event: MatTabChangeEvent) {
    //console.log(event);

    this.einkaufswagentab = event.tab.textLabel === "99999";

    this.getCurrentButtons(event.tab.textLabel);

    this.calculateTotalPrice();
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

      if (button.vorgaenger.endsWith("/"))
      {
        button.vorgaenger = button.vorgaenger.slice(0, -1);
      }

      if (button.vorgaenger.includes('/'))
      {
        let dividedStrings;
        dividedStrings = button.vorgaenger.split('/');

        dividedStrings.forEach((vgaenger: any) =>{
          if(vgaenger === vorgaenger)
          {

            this.currentButtons.push(button);
          }
        })
      }
      if (button.vorgaenger === vorgaenger)
      {
        this.currentButtons.push(button);
      }
    });
  }

  produktButtonClick(button: any)
  {

      if (this.hasUntermenue(button))
      { console.log("a");
        this.getCurrentButtons(button.id);
      }
      else
      {
        this.addToEinkaufswagen(button);
      }
  }

  hasUntermenue(button: any)
  {
    return this.allButtons.some(obj => obj.vorgaenger === button.id);
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
  //  console.log(this.einkaufswagen);
  }

  submitOrder() {
   // console.log(this.einkaufswagen);
    this.httpService.sendData(this.einkaufswagen, this.tischname).subscribe(response => {
      console.log('Response:', response); // Log the response
    }, error => {
      console.error('Error:', error); // Log the error
    });

    this.einkaufswagen.length = 0;
    this.calculateTotalPrice();
  }

  addItem(i: number) {
    this.einkaufswagen[i].quantity++;

    this.calculateTotalPrice();
  }

  removeItem(i: number) {
    this.einkaufswagen[i].quantity--;

    if (this.einkaufswagen[i].quantity <= 0 )
    {
      this.einkaufswagen.splice(i,1);
    }

    this.calculateTotalPrice();
  }

  goBack() {
    if (this.allButtons.find(obj => obj.id === this.currentButtons[0].vorgaenger).vorgaenger != 0)
    {
      this.getCurrentButtons(this.allButtons.find(obj => obj.id === this.currentButtons[0].vorgaenger).vorgaenger);
    }
  }

  calculateTotalPrice()
  {
    this.totalPrice = 0;

    // Iterate over each item in cartItems and sum up the prices
    for (const item of this.einkaufswagen) {
      this.totalPrice += item.preis * item.quantity;
    }

    this.totalPrice = this.totalPrice.toFixed(2);
  }

  addZutaten(i: number) {


  }


  @ViewChild('popup') popup!: TextPopupComponent;

  addInfo(i: number)
  {
    this.popup.open(this.einkaufswagen[i].info, i);
  }

  handleSubmit(eventData: { userInput: string, selectedProdukt: number })
  {
      this.einkaufswagen[eventData.selectedProdukt].info = eventData.userInput;
  }
}

