import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Lecture } from './lecture';
import { LectureRecording } from './lectureRecording';
import { LectureService } from './lecture.service';

import { VgMedia, VgAPI } from 'videogular2/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css']
})
export class LectureComponent implements OnInit {
  api: VgAPI;
  lecture: Lecture;
  selectedRecording: LectureRecording;

  constructor(private lectureService: LectureService) { }

  ngOnInit() {
    this.getLecture();
  }

  onSelect(recording: LectureRecording): void {
    if (recording.processing === true) {
      return;
    }

    this.selectedRecording = recording;
  }

  getLecture(): void {
    this.lectureService.getLecture().subscribe(
      lecture => {
        this.lecture = lecture;
        if (lecture.recordings.length > 0) {
          const recordings = lecture.recordings.filter(x => x.processing === false || typeof(x.processing) === 'undefined');

          if (recordings.length > 0) {
            this.selectedRecording = recordings[0];
          }
        }
      });
  }
}
