import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselTab } from './carousel-tab';

describe('CarouselTab', () => {
  let component: CarouselTab;
  let fixture: ComponentFixture<CarouselTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
