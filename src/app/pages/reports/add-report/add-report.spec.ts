import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReport } from './add-report';

describe('AddReport', () => {
  let component: AddReport;
  let fixture: ComponentFixture<AddReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
