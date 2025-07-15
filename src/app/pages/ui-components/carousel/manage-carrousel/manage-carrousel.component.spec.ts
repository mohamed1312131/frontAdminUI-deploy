import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCarrouselComponent } from './manage-carrousel.component';

describe('ManageCarrouselComponent', () => {
  let component: ManageCarrouselComponent;
  let fixture: ComponentFixture<ManageCarrouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCarrouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageCarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
