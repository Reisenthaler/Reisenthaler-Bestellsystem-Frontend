import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZutatenPopupComponent } from './zutaten-popup.component';

describe('ZutatenPopupComponent', () => {
  let component: ZutatenPopupComponent;
  let fixture: ComponentFixture<ZutatenPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZutatenPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZutatenPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
