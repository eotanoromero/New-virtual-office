import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRefund } from './add-refund';

describe('AddRefund', () => {
  let component: AddRefund;
  let fixture: ComponentFixture<AddRefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRefund]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRefund);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
