import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalId } from './digital-id';

describe('DigitalId', () => {
  let component: DigitalId;
  let fixture: ComponentFixture<DigitalId>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalId]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalId);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
