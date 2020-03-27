import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { Lecture } from '../shared/lecture';
import { LectureRecording } from '../shared/lectureRecording';
import { LectureService } from '../shared/lecture.service';

import { MatTableDataSource } from '@angular/material/table';

import { ActivatedRoute } from '@angular/router';
import { Course } from '../shared/course';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.css'],
})
export class LectureComponent implements OnInit {
  @ViewChild('videoplayer', {static: true}) private player: ElementRef;

  course: Course;
  lecture: Lecture;
  selectedRecording: LectureRecording;

  searchText = new FormControl();
  searchList: any[];

  dataSource: MatTableDataSource<LectureRecording>;
  displayedColumns = ['name', 'date'];

  playerConfig: any;

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

    this.setVideo(recording);
  }

  onSearchTextChange(): void {
    let searchString = this.searchText.value.toLowerCase();

    if (searchString.length > 0) {
      this.searchList = this.selectedRecording.slides.filter(x => x.ocr.toLowerCase().includes(searchString)).slice(0, 6);
    } else {
      this.searchList = [];
    }
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
              this.setVideo(recordings[0]);
            }
          }
        });
    });
  }

  seekTo(position: number): void {
    this.player.nativeElement.seek(position);
  }

  setVideo(recording: LectureRecording): void {
    if (this.selectedRecording) {
      this.selectedRecording.active = false;
    }

    this.searchText.setValue('');

    this.selectedRecording = recording;
    this.selectedRecording.active = true;

    let cfg: any = {
      "streams":[{
        "hd": this.course.folder + '/' + this.selectedRecording.fileName
      }],
      "fallbackStream": null,
      "slides": this.selectedRecording.slides,
      "accentColor": "#9c1926",
      "fontColorOnAccentColor": "#FFFFFF"
    };

    if (cfg.slides) {
      cfg.slides.forEach(element => {
        element.thumbnail = this.course.folder + '/video/' + element.thumbnail;
      });
    }

    if (this.selectedRecording.presenterFileName) {
      cfg.streams = [{
        "hd": this.course.folder + '/video/' + this.selectedRecording.presenterFileName,
        "muted": true
      }, {
        "hd": this.course.folder + '/video/' + this.selectedRecording.fileName
      }];
      cfg.fallbackStream = {
        "hd": this.course.folder + '/video/' + this.selectedRecording.fileName
      }
    }

    this.player.nativeElement.seek(0);

    this.player.nativeElement.configuration = cfg;
    this.player.nativeElement.reloadConfiguration();
  }
}
