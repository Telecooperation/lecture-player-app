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

  getLecture(id: string, videoId?: string): void {
    this.lectureService.getCourses().subscribe(courses => {
      this.course = courses.filter(y => y.id === id)[0];

      this.lectureService.getLecture(this.course.folder).subscribe(
        lecture => {
          this.lecture = lecture;
          this.lecture.recordings = this.lecture.recordings.sort((a, b) => -1 * (+new Date(a.date) - +new Date(b.date)));

          this.lecture.recordings.forEach(recording => {
            recording.id = recording.name.replace(/(\s)*/g, '').toLowerCase();
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
          "sd": this.course.folder + '/video/' + this.selectedRecording.presenterFileName,
          "hd": this.course.folder + '/video/' + this.selectedRecording.presenterFileNameHd
        };
        cfg.streams.push(presenterFile);
      } else {
        const presenterFile = {
          "hd": this.course.folder + '/video/' + this.selectedRecording.presenterFileName
        };
        cfg.streams.push(presenterFile);
      }
    }

    // slide video
    if (this.selectedRecording.fileNameHd) {
      const slideFile = {
        "sd": this.course.folder + '/video/' + this.selectedRecording.fileName,
        "hd": this.course.folder + '/video/' + this.selectedRecording.fileNameHd,
        "muted": cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    } else {
      const slideFile = {
        "hd": this.course.folder + '/video/' + this.selectedRecording.fileName,
        "muted": cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    }

    // do we have a stage video?
    if (this.selectedRecording.stageVideo) {
      cfg.fallbackStream = {
        "hd": this.course.folder + '/video/' + this.selectedRecording.stageVideo
      };

      if (this.selectedRecording.stageVideoHd) {
        cfg.fallbackStream['sd'] = cfg.fallbackStream['hd'];
        cfg.fallbackStream['hd'] = this.course.folder + '/video/' + this.selectedRecording.stageVideoHd;
      }
    } else {
      cfg.fallbackStream = {
        "hd": this.course.folder + '/video/' + this.selectedRecording.fileName
      };

      if (this.selectedRecording.fileNameHd) {
        cfg.fallbackStream['sd'] = cfg.fallbackStream['hd'];
        cfg.fallbackStream['hd'] = this.course.folder + '/video/' + this.selectedRecording.fileNameHd;
      }
    }

    if (cfg.slides) {
      cfg.slides.forEach(element => {
        element.thumbnail = this.course.folder + '/video/' + element.thumbnail;
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
    }
  }
}
