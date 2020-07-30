import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturePlayerComponent } from './lecture-player.component';

describe('LecturePlayerComponent', () => {
  let component: LecturePlayerComponent;
  let fixture: ComponentFixture<LecturePlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LecturePlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LecturePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
