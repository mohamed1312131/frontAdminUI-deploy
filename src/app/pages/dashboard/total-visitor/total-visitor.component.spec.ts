import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalVisitorComponent } from './total-visitor.component';

describe('TotalVisitorComponent', () => {
  let component: TotalVisitorComponent;
  let fixture: ComponentFixture<TotalVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalVisitorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
