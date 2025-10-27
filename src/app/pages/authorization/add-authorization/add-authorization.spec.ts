import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAuthorization } from './add-authorization';

describe('AddAuthorization', () => {
  let component: AddAuthorization;
  let fixture: ComponentFixture<AddAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAuthorization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAuthorization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
