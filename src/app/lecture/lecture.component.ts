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

  weeks: {};

  playerConfig: any;

  constructor(private lectureService: LectureService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.getLecture(params.get('id'), params.get('videoid'));
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

  sortByDateAndName(a: LectureRecording, b: LectureRecording): number {
    if (a.date === b.date) {
      return a.name > b.name ? 1 : -1;
    }
    return (+new Date(a.date) - +new Date(b.date))
  }

  getLecture(id: string, videoId?: string): void {
    this.lectureService.getCourses().subscribe(courses => {
      this.course = courses.filter(y => y.id === id)[0];

      this.lectureService.getLecture(this.course.folder).subscribe(
        lecture => {
          this.lecture = lecture;

          if (this.course.publishMode) {
            let todaysDate = new Date();
            this.lecture.recordings = this.lecture.recordings.filter(x => {
              let d = new Date(Date.parse(x.date));
              d.setHours(0, 0, 0, 0);
              
              return d <= todaysDate
            });
          }

          this.lecture.recordings = this.lecture.recordings.sort(this.sortByDateAndName);

          this.weeks = {};
          this.lecture.recordings.forEach(recording => {
            recording.id = recording.name.replace(/(\s)*/g, '').toLowerCase();

            if (this.course.weekView) {
              var week = this.getWeekNumber(new Date(Date.parse(recording.date)));
              recording.week = week[0] + ', Week ' + String(week[1]).padStart(2, '0');

              this.weeks[recording.week] = this.weeks[recording.week] || [];
              this.weeks[recording.week].push(recording);
            }

            if (!recording.description) {
              recording.description = recording.name;
            }
          });

          this.dataSource = new MatTableDataSource<LectureRecording>(this.lecture.recordings);

          if (lecture.recordings.length > 0) {
            const recordings = lecture.recordings
              .filter(x => x.processing === false || typeof(x.processing) === 'undefined');

            if (recordings.length > 0) {
              if (videoId) {
                const selected = recordings.filter(x => x.id == videoId);
                this.setVideo(selected[0]);
              } else {
                this.setVideo(recordings[0]);
              }
            }
          }
        });
    });
  }

  getWeekNumber(d: Date): number[] {
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      // Get first day of year
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      // Calculate full weeks to nearest Thursday
      var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
      // Return array of year and week number
      return [d.getUTCFullYear(), weekNo];
  }

  seekTo(position: number): void {
    this.player.nativeElement.seek(position);
  }

  setVideo(recording: LectureRecording): void {
    if (this.selectedRecording) {
      this.selectedRecording.active = false;
    }

    this.searchText.setValue('');
    this.searchList = [];

    this.selectedRecording = recording;
    this.selectedRecording.active = true;

    // do we have a presenter video -> dual stream
    let cfg = {
      "streams": [],
      "fallbackStream": null,
      "slides": this.selectedRecording.slides,
      "accentColor": "#9c1926",
      "fontColorOnAccentColor": "#FFFFFF"
    };
    
    // presenter video
    if (this.selectedRecording.presenterFileName) {
      if (this.selectedRecording.presenterFileNameHd) {
        const presenterFile = {
          "sd": this.course.folder + '/' + this.selectedRecording.presenterFileName,
          "hd": this.course.folder + '/' + this.selectedRecording.presenterFileNameHd
        };
        cfg.streams.push(presenterFile);
      } else {
        const presenterFile = {
          "hd": this.course.folder + '/' + this.selectedRecording.presenterFileName
        };
        cfg.streams.push(presenterFile);
      }
    }

    // slide video
    if (this.selectedRecording.fileNameHd) {
      const slideFile = {
        "sd": this.course.folder + '/' + this.selectedRecording.fileName,
        "hd": this.course.folder + '/' + this.selectedRecording.fileNameHd,
        "muted": cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    } else {
      const slideFile = {
        "hd": this.course.folder + '/' + this.selectedRecording.fileName,
        "muted": cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    }

    // do we have a stage video?
    if (this.selectedRecording.stageVideo) {
      cfg.fallbackStream = {
        "hd": this.course.folder + '/' + this.selectedRecording.stageVideo
      };

      if (this.selectedRecording.stageVideoHd) {
        cfg.fallbackStream['sd'] = cfg.fallbackStream['hd'];
        cfg.fallbackStream['hd'] = this.course.folder + '/' + this.selectedRecording.stageVideoHd;
      }
    } else {
      cfg.fallbackStream = {
        "hd": this.course.folder + '/' + this.selectedRecording.fileName
      };

      if (this.selectedRecording.fileNameHd) {
        cfg.fallbackStream['sd'] = cfg.fallbackStream['hd'];
        cfg.fallbackStream['hd'] = this.course.folder + '/' + this.selectedRecording.fileNameHd;
      }
    }

    if (cfg.slides) {
      cfg.slides.forEach(element => {
        element.thumbnail = this.course.folder + '/' + element.thumbnail;
      });
    }

    // add empty slides if undefined
    if (cfg.slides === undefined) {
      cfg.slides = [];
    }

    if (this.player.nativeElement !== undefined) {
      this.player.nativeElement.seek(0);

      this.player.nativeElement.configuration = cfg;
      this.player.nativeElement.reloadConfiguration();

      if (window.localStorage.getItem('fallbackVideo') !== 'false' && cfg.fallbackStream) {
        this.player.nativeElement.showFallbackVideo();
        window.localStorage.setItem('fallbackVideo', 'true');
      }
    }
  }
}
