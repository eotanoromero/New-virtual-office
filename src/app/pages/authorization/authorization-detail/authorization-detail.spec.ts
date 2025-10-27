import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationDetail } from './authorization-detail';

describe('AuthorizationDetail', () => {
  let component: AuthorizationDetail;
  let fixture: ComponentFixture<AuthorizationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizationDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
