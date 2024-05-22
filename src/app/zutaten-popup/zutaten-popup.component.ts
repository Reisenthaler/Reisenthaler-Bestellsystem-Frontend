import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-zutaten-popup',
  templateUrl: './zutaten-popup.component.html',
  styleUrls: ['./zutaten-popup.component.scss']
})
export class ZutatenPopupComponent {

  selectedZutaten: number[] = [];
  produkt: any ;
  constructor(
    public dialogRef: MatDialogRef<ZutatenPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { zutaten: any[], selectedZutaten: number[], produktId: any }
  ) {
    this.selectedZutaten = [...data.selectedZutaten]; // Copy initial selected zutaten
    this.produkt = data.produktId;
  }

  toggleSelection(zutatId: number) {
    const index = this.selectedZutaten.indexOf(zutatId);
    if (index === -1) {
      this.selectedZutaten.push(zutatId);
    } else {
      this.selectedZutaten.splice(index, 1);
    }
  }

  submitSelection() {
    const result = {
      selectedZutaten: this.selectedZutaten,
      produktId: this.produkt // Replace with actual additional data
    };

    this.dialogRef.close(result);
  }

  closePopup() {
    this.dialogRef.close();
  }

}
