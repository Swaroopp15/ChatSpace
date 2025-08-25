import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterName } from './enter-name';

describe('EnterName', () => {
  let component: EnterName;
  let fixture: ComponentFixture<EnterName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterName]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
