import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthProvider } from './health-provider';

describe('HealthProvider', () => {
  let component: HealthProvider;
  let fixture: ComponentFixture<HealthProvider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthProvider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthProvider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
