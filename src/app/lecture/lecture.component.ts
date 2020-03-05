import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Lecture } from './lecture';
import { LectureRecording } from './lectureRecording';
import { LectureService } from './lecture.service';

import { MatTableDataSource } from '@angular/material/table';

import { PlyrModule, PlyrComponent } from 'ngx-plyr';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css'],
})
export class LectureComponent implements OnInit {
  @ViewChild('player', {static: true}) private player: PlyrComponent;

  lecture: Lecture;
  selectedRecording: LectureRecording;

  dataSource: MatTableDataSource<LectureRecording>;
  displayedColumns = ['name', 'date'];

  constructor(private lectureService: LectureService) { }

  ngOnInit() {
    this.getLecture();
  }

  onSelect(recording: LectureRecording): void {
    if (recording.processing === true) {
      return;
    }
    console.log(recording);

    this.selectedRecording.active = false;
    recording.active = true;

    this.selectedRecording = recording;
  }

  getLecture(): void {
    this.lectureService.getLecture().subscribe(
      lecture => {
        this.lecture = lecture;
        this.lecture.recordings = this.lecture.recordings.sort((a, b) => -1 * (+new Date(a.date) - +new Date(b.date)));
        this.dataSource = new MatTableDataSource<LectureRecording>(this.lecture.recordings);

        if (lecture.recordings.length > 0) {
          const recordings = lecture.recordings
            .filter(x => x.processing === false || typeof(x.processing) === 'undefined');

          if (recordings.length > 0) {
            this.selectedRecording = recordings[0];
            this.selectedRecording.active = true;
          }
        }
      });
  }
}
