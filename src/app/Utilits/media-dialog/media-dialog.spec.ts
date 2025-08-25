import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDialog } from './media-dialog';

describe('MediaDialog', () => {
  let component: MediaDialog;
  let fixture: ComponentFixture<MediaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
