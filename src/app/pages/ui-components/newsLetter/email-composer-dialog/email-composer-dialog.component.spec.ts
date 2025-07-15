import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailComposerDialogComponent } from './email-composer-dialog.component';

describe('EmailComposerDialogComponent', () => {
  let component: EmailComposerDialogComponent;
  let fixture: ComponentFixture<EmailComposerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailComposerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailComposerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
