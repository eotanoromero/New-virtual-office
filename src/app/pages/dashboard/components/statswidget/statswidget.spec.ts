import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Statswidget } from './statswidget';

describe('Statswidget', () => {
  let component: Statswidget;
  let fixture: ComponentFixture<Statswidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Statswidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Statswidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
