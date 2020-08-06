import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { Lecture } from '../shared/lecture';
import { LectureRecording } from '../shared/lectureRecording';
import { LectureService } from '../shared/lecture.service';

import { MatTableDataSource } from '@angular/material/table';

import { ActivatedRoute } from '@angular/router';
import { Course } from '../shared/course';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css'],
})
export class LectureComponent implements OnInit {
  course: Course;
  lecture: Lecture;

  dataSource: MatTableDataSource<LectureRecording>;
  displayedColumns = ['name', 'duration', 'date'];

  rowView = true;

  constructor(private lectureService: LectureService,
    private route: ActivatedRoute) {
      const rowView = localStorage.getItem('rowView');
      this.rowView = rowView ? rowView === 'true' : true;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.getCourse(params.get('id'));
    });
  }

  onSelect(recording: LectureRecording): void {
  }

  sortByDateAndName(a: LectureRecording, b: LectureRecording): number {
    if (a.date === b.date) {
      return a.name > b.name ? 1 : -1;
    }
    return (+new Date(a.date) - +new Date(b.date));
  }

  humanizeDuration(sec_num: number): string {
    if (sec_num === undefined || sec_num === 0) {
      return '';
    }

    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    let hours_s, minutes_s, seconds_s;

    if (hours   < 10) { hours_s   = '0' + hours; }
    if (minutes < 10) { minutes_s = '0' + minutes; }
    if (seconds < 10) { seconds_s = '0' + seconds; }
    return hours_s + 'h ' + minutes + 'm';
  }

  getCourse(id: string): void {
    this.lectureService.getCourses().subscribe(courses => {
      this.course = courses.filter(y => y.id === id)[0];

      this.lectureService.getLecture(this.course.folder).subscribe(
        lecture => {
          this.lecture = lecture;

          if (this.course.publishMode) {
            const todaysDate = new Date();
            this.lecture.recordings = this.lecture.recordings.filter(x => {
              const d = new Date(Date.parse(x.date));
              d.setHours(0, 0, 0, 0);

              return d <= todaysDate;
            });
          }

          this.lecture.recordings = this.lecture.recordings.sort(this.sortByDateAndName);
          this.lecture.recordings.forEach(recording => {
            recording.id = recording.name.replace(/(\s)*/g, '').toLowerCase();

            if (!recording.description) {
              recording.description = recording.name;
            }
          });

          this.dataSource = new MatTableDataSource<LectureRecording>(this.lecture.recordings);
        });
    });
  }

  switchView(): void {
    this.rowView = !this.rowView;
    localStorage.setItem('rowView', this.rowView ? 'true' : 'false');
  }
}
