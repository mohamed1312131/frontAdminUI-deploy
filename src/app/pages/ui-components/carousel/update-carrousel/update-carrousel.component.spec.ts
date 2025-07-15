import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCarrouselComponent } from './update-carrousel.component';

describe('UpdateCarrouselComponent', () => {
  let component: UpdateCarrouselComponent;
  let fixture: ComponentFixture<UpdateCarrouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCarrouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
