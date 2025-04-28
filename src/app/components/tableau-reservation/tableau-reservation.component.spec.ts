import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauReservationComponent } from './tableau-reservation.component';

describe('TableauReservationComponent', () => {
  let component: TableauReservationComponent;
  let fixture: ComponentFixture<TableauReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableauReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableauReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
