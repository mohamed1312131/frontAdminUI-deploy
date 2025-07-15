import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCarrouselComponent } from './add-carrousel.component';

describe('AddCarrouselComponent', () => {
  let component: AddCarrouselComponent;
  let fixture: ComponentFixture<AddCarrouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCarrouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
