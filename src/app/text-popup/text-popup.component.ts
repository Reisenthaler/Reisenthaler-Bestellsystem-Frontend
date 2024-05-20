import { Component, EventEmitter, Output } from '@angular/core';
import {T} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-text-popup',
  templateUrl: './text-popup.component.html',
  styleUrls: ['./text-popup.component.scss']
})
export class TextPopupComponent {
  isOpen = false;
  userInput: string = '';
  selectedProdukt: number = 0;
  @Output() submitEvent = new EventEmitter<{ userInput: string, selectedProdukt: number }>();

  open(oldInfo: string, selectedProdukt: number)
  {
    this.userInput = oldInfo;
    this.selectedProdukt = selectedProdukt;
    this.isOpen = true;
  }

  close()
  {
    this.isOpen = false;
  }

  submit()
  {
    this.submitEvent.emit({ userInput: this.userInput, selectedProdukt: this.selectedProdukt });
    this.close();
  }
}
