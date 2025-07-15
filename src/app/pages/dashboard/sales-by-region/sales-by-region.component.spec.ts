import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByRegionComponent } from './sales-by-region.component';

describe('SalesByRegionComponent', () => {
  let component: SalesByRegionComponent;
  let fixture: ComponentFixture<SalesByRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByRegionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesByRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
