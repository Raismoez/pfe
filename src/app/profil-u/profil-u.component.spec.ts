import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilUComponent } from './profil-u.component';

describe('ProfilUComponent', () => {
  let component: ProfilUComponent;
  let fixture: ComponentFixture<ProfilUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
