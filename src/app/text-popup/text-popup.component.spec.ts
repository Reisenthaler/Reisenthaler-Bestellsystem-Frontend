import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPopupComponent } from './text-popup.component';

describe('TextPopupComponent', () => {
  let component: TextPopupComponent;
  let fixture: ComponentFixture<TextPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
