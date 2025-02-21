import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotdepasseComponent } from './motdepasse.component';

describe('MotdepasseComponent', () => {
  let component: MotdepasseComponent;
  let fixture: ComponentFixture<MotdepasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MotdepasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotdepasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
