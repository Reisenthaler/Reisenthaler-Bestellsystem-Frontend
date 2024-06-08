import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { HttpService } from "./http.service";
import { MatTabChangeEvent, MatTabGroup } from "@angular/material/tabs";
import { MatDialog } from "@angular/material/dialog";
import { TextPopupComponent } from "./text-popup/text-popup.component";
import { ZutatenPopupComponent } from "./zutaten-popup/zutaten-popup.component";

interface Zutat {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Reisenthaler-Bestellsystem-Frontend';
  @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup;

  tischname: String = "";
  allButtons: any[] = [];
  currentButtons: any[] = [];
  einkaufswagen: any[] = [];
  einkaufswagentab: boolean = true;
  totalPrice: any;

  showBackButton: boolean = false;
  showWeiterButton: boolean = false;

  navigationItems = [
    { label: 'Bestellung', icon: 'home', route: '/Bestellung', id: 99999 },
  ];

  constructor(private http: HttpClient, private httpService: HttpService, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tischname = params['tischname'];
      console.log(this.tischname);
    });

    this.httpService.getAllButtons().subscribe(
      (data: any) => {
        this.allButtons = data;
        console.log("allbuttons");
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

  ngAfterViewInit(): void {
    // Check tabGroup initialization
    if (this.tabGroup) {
      // Access tabGroup properties or perform actions
      this.tabGroup.selectedIndex = 0; // Example usage
    } else {
      console.error('Tab Group is not initialized.');
    }
  }

  private handleUpdate() {
    this.httpService.getAllButtons().subscribe(
      (data: any) => {
        this.allButtons = data;
        this.currentButtons.forEach((button: any) => {
          if (!this.allButtons.includes(button)) {
            this.currentButtons = this.currentButtons.filter(item => item !== button);
          }
        })
        this.httpService.sentUpToDate();
      });
  }

  onTabChange(event: MatTabChangeEvent) {
    if(this.einkaufswagentab = event.tab.textLabel === "99999")
    {
      this.showWeiterButton = false;
      this.showBackButton = false;
    }
    else
      if (this.einkaufswagen.length != 0)
      {
        this.showWeiterButton = true;
      }
      this.getCurrentButtons(event.tab.textLabel);
    this.calculateTotalPrice();
  }

  addButtonsToNavBar(allbuttons: any[]) {
    allbuttons.forEach((button: any) => {
      if (button.kategorie === '') {
        this.navigationItems.push({ label: button.name, icon: 'home', route: '/' + button.name, id: button.id });
      }
    });
  }

  getCurrentButtons(vorgaenger: any) {
    this.currentButtons.length = 0;
    this.allButtons.forEach((button: any) => {
      if (button.vorgaenger.endsWith("/")) {
        button.vorgaenger = button.vorgaenger.slice(0, -1);
      }
      if (button.vorgaenger.includes('/')) {
        let dividedStrings = button.vorgaenger.split('/');
        dividedStrings.forEach((vgaenger: any) => {
          if (vgaenger === vorgaenger) {
            this.currentButtons.push(button);
          }
        })
      }
      if (button.vorgaenger === vorgaenger) {
        this.currentButtons.push(button);
      }
    });
  }

  produktButtonClick(button: any) {
    if (this.hasUntermenue(button)) {
     this.showBackButton = true;

      this.getCurrentButtons(button.id);
    } else {
      this.showWeiterButton = true;


      this.addToEinkaufswagen(button);
    }
  }

  hasUntermenue(button: any) {
    return this.allButtons.some(obj => obj.vorgaenger === button.id);
  }

  addToEinkaufswagen(button: any) {
    if (this.einkaufswagen.includes(button)) {
      this.einkaufswagen[this.einkaufswagen.indexOf(button)].quantity++;
    } else {
      this.einkaufswagen.push(button);
      this.einkaufswagen[this.einkaufswagen.length - 1].ausgewaelteZutaten = "";
    }
    console.log(this.einkaufswagen);
  }

  submitOrder() {
    this.httpService.sendData(this.einkaufswagen, this.tischname).subscribe(response => {
      console.log('Response:', response);
    }, error => {
      console.error('Error:', error);
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
    if (this.einkaufswagen[i].quantity <= 0) {
      this.einkaufswagen.splice(i, 1);
    }
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = 0;
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

  openZutatenPopup(i: number) {
    this.zutatenPopup.produkt = i;
    this.getZutaten(i);
    const dialogRef = this.dialog.open(ZutatenPopupComponent, {
      width: '400px',
      data: { zutaten: this.zutaten, selectedZutaten: this.selectedZutaten, produktId: i }
    });

    dialogRef.afterClosed().subscribe((result: { selectedZutaten: number[], produktId: number }) => {
      if (result != null) {
        this.setZutaten(result.produktId, result.selectedZutaten);
      }
    });
  }

  getZutaten(i: number) {
    this.zutaten.length = 0;
    this.allButtons.forEach(button => {
      if (this.einkaufswagen[i].moeglicheZutaten.endsWith("/")) {
        this.einkaufswagen[i].moeglicheZutaten = this.einkaufswagen[i].moeglicheZutaten.slice(0, -1);
      }
      if (this.einkaufswagen[i].moeglicheZutaten.includes('/')) {
        let dividedStrings = this.einkaufswagen[i].moeglicheZutaten.split('/');
        dividedStrings.forEach((vgaenger: any) => {
          if (vgaenger === button.vorgaenger) {
            this.zutaten.push({ id: button.id, name: button.name });
          }
        })
      }
    });

    this.selectedZutaten.length = 0;
    this.allButtons.forEach(button => {
      if (this.einkaufswagen[i].ausgewaelteZutaten.includes(';')) {
        let dividedStrings = this.einkaufswagen[i].ausgewaelteZutaten.split(';');
        dividedStrings.forEach((zutaten: any) => {
          if (zutaten === button.id) {
            this.selectedZutaten.push(button.id);
          }
        })
      } else if (this.einkaufswagen[i].ausgewaelteZutaten === button.id) {
        this.selectedZutaten.push(button.id);
      }
    });
  }

  setZutaten(i: number, ausgewaelteZutaten: any[]) {
    this.einkaufswagen[i].ausgewaelteZutaten = ausgewaelteZutaten.join(";");
  }

  @ViewChild('popup') popup!: TextPopupComponent;

  addInfo(i: number) {
    this.popup.open(this.einkaufswagen[i].info, i);
  }

  handleSubmit(eventData: { userInput: string, selectedProdukt: number }) {
    this.einkaufswagen[eventData.selectedProdukt].info = eventData.userInput;
  }

  goBack() {
    this.getCurrentButtons(this.allButtons.find(obj => obj.id === this.currentButtons[0].vorgaenger).vorgaenger);
    this.showBackButton = false;
  }

  goWeiter() {
    setTimeout(() => {
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = 0;
        const event: MatTabChangeEvent = {
          index: 0,
          tab: {
            textLabel: "99999",
            disabled: false
          } as any
        };
        this.onTabChange(event);
        this.getCurrentButtons("99999");
        this.calculateTotalPrice();
      } else {
        console.error('Tab Group is not initialized.');
      }
    });
  }
}
