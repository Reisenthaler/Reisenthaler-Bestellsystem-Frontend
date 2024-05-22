import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {HttpService} from "./http.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {MatDialog} from "@angular/material/dialog";
import {TextPopupComponent} from "./text-popup/text-popup.component";
import {ZutatenPopupComponent} from "./zutaten-popup/zutaten-popup.component";


interface Zutat {
  id: number;
  name: string;
}
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
    console.log("eink: " );
    console.log("eink: " );
    console.log( this.einkaufswagen);
    this.httpService.sendData(this.einkaufswagen, this.tischname).subscribe(response => {
      console.log('Response:', response); // Log the response
    }, error => {
      console.error('Error:', error); // Log the error
    });

    this.einkaufswagen.length = 0;
    this.calculateTotalPrice();
  }

  addItem(i: number) {
    console.log(i);
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

  @ViewChild('popup') zutatenPopup!: ZutatenPopupComponent;

  zutaten: Zutat[] = [
    { id: 1, name: 'Zutat 1' },
    { id: 2, name: 'Zutat 2' },
    { id: 3, name: 'Zutat 3' }
  ];
  selectedZutaten: number[] = [];
  showZutatenPopup: boolean = false; // Flag to control popup visibility

  openZutatenPopup(i: number) {
    this.zutatenPopup.produkt = i;
    this.getZutaten(i);
    const dialogRef = this.dialog.open(ZutatenPopupComponent, {
      width: '400px',
      data: { zutaten: this.zutaten, selectedZutaten: this.selectedZutaten, produktId: i }
    });

    dialogRef.afterClosed().subscribe((result: { selectedZutaten: number[], produktId: number }) => {
      if (result.selectedZutaten) {
        this.selectedZutaten = result.selectedZutaten;
this.setZutaten(result.produktId, result.selectedZutaten);


      }
    });
}
getZutaten(i: number)
{
  console.log("get Start");
console.log(this.einkaufswagen[i]);
  this.zutaten.length = 0;

  this.allButtons.forEach(button => {
    if (this.einkaufswagen[i].moeglicheZutaten.endsWith("/"))
    {
      this.einkaufswagen[i].moeglicheZutaten = this.einkaufswagen[i].moeglicheZutaten.slice(0, -1);
    }
    if (this.einkaufswagen[i].moeglicheZutaten.includes('/'))
    {
      let dividedStrings;
      dividedStrings = this.einkaufswagen[i].moeglicheZutaten.split('/');

      dividedStrings.forEach((vgaenger: any) =>{
        if(vgaenger === button.vorgaenger)
        {
          this.zutaten.push({id: button.id, name: button.name});
        }
      })
    }


  });

  this.selectedZutaten.length = 0;
  console.log(this.einkaufswagen[i].ausgewaelteZutaten);
  this.allButtons.forEach(button => {

    if (this.einkaufswagen[i].ausgewaelteZutaten.includes(';'))
    {
      let dividedStrings;
      dividedStrings = this.einkaufswagen[i].ausgewaelteZutaten.split(';');

      dividedStrings.forEach((zutaten: any) =>{
        if(zutaten === button.id)
        {
          this.selectedZutaten.push( button.id);
        }
      })
    }
    else if(this.einkaufswagen[i].ausgewaelteZutaten === button.id)
    {
      this.selectedZutaten.push( button.id);
    }



      });
  console.log(this.selectedZutaten);

}

setZutaten(i:number, ausgewaelteZutaten: any[])
{
  //console.log("set Start");
  //console.log(ausgewaelteZutaten.join(";"));
 // this.einkaufswagen[i].ausgewaelteZutaten = " aa";
//  console.log(this.einkaufswagen[i]);
//console.log(i);
  //  console.log(ausgewaelteZutaten);
    //console.log(ausgewaelteZutaten.join(";"));
      this.einkaufswagen[i].ausgewaelteZutaten = ausgewaelteZutaten.join(";");


  //console.log("ekz: " + this.einkaufswagen[i].ausgewaelteZutaten);

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

