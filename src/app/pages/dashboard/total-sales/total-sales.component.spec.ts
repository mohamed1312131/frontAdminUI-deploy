import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSalesComponent } from './total-sales.component';

describe('TotalSalesComponent', () => {
  let component: TotalSalesComponent;
  let fixture: ComponentFixture<TotalSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
