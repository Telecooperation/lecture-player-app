import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Lecture } from '../shared/lecture';
import { LectureRecording } from '../shared/lectureRecording';
import { LectureService } from '../shared/lecture.service';

import { MatTableDataSource } from '@angular/material/table';

import { PlyrModule, PlyrComponent } from 'ngx-plyr';
import { ActivatedRoute } from '@angular/router';
import { Course } from '../shared/course';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css'],
})
export class LectureComponent implements OnInit {
  @ViewChild('player', {static: true}) private player: PlyrComponent;

  course: Course;
  lecture: Lecture;
  selectedRecording: LectureRecording;

  dataSource: MatTableDataSource<LectureRecording>;
  displayedColumns = ['name', 'date'];

  constructor(private lectureService: LectureService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.getLecture(params.get('id'));
    });
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

  getLecture(id: string): void {
    this.lectureService.getCourses().subscribe(courses => {
      this.course = courses.filter(y => y.id === id)[0];

      this.lectureService.getLecture(this.course.folder).subscribe(
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
    });
  }
}
