import { ComponentFixture, TestBed } from '@angular/core/testing';

import { profilAComponent } from './profilA.component';

describe('DashboardComponent', () => {
  let component: profilAComponent;
  let fixture: ComponentFixture<profilAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [profilAComponent]
    });
    fixture = TestBed.createComponent(profilAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
