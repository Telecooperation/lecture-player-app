import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Course } from '../shared/course';
import { Lecture } from '../shared/lecture';
import { LectureService } from '../shared/lecture.service';
import { ActivatedRoute } from '@angular/router';
import { LectureRecording } from '../shared/lectureRecording';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-lecture-player',
  templateUrl: './lecture-player.component.html',
  styleUrls: ['./lecture-player.component.css']
})
export class LecturePlayerComponent implements OnInit {
  @ViewChild('videoplayer', {static: true}) private player: ElementRef;

  course: Course;
  lecture: Lecture;
  selectedRecording: LectureRecording;

  searchText = new FormControl();
  searchList: any[];

  playerConfig: any;

  constructor(private lectureService: LectureService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.getLecture(params.get('id'), params.get('videoid'));
    });
  }

  onSearchTextChange(): void {
    const searchString = this.searchText.value.toLowerCase();

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
    return (+new Date(a.date) - +new Date(b.date));
  }

  getLecture(id: string, videoId?: string): void {
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

          // set ordering and fix ids
          this.lecture.recordings = this.lecture.recordings.sort(this.sortByDateAndName);
          this.lecture.recordings.forEach(recording => {
            recording.id = recording.name.replace(/(\s)*/g, '').toLowerCase();

            if (!recording.description) {
              recording.description = recording.name;
            }
          });

          if (lecture.recordings.length > 0) {
            const recordings = lecture.recordings
              .filter(x => x.processing === false || typeof(x.processing) === 'undefined');

            if (recordings.length > 0) {
              if (videoId) {
                const selected = recordings.filter(x => x.id === videoId);
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
      'streams': [],
      'fallbackStream': null,
      'slides': this.selectedRecording.slides,
      'accentColor': '#9c1926',
      'fontColorOnAccentColor': '#FFFFFF',
      'playlist': null
    };

    // presenter video
    if (this.selectedRecording.presenterFileName) {
      if (this.selectedRecording.presenterFileNameHd) {
        const presenterFile = {
          'sd': this.course.folder + '/' + this.selectedRecording.presenterFileName,
          'hd': this.course.folder + '/' + this.selectedRecording.presenterFileNameHd
        };
        cfg.streams.push(presenterFile);
      } else {
        const presenterFile = {
          'hd': this.course.folder + '/' + this.selectedRecording.presenterFileName
        };
        cfg.streams.push(presenterFile);
      }
    }

    // slide video
    if (this.selectedRecording.fileNameHd) {
      const slideFile = {
        'sd': this.course.folder + '/' + this.selectedRecording.fileName,
        'hd': this.course.folder + '/' + this.selectedRecording.fileNameHd,
        'muted': cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    } else {
      const slideFile = {
        'hd': this.course.folder + '/' + this.selectedRecording.fileName,
        'muted': cfg.streams.length > 0
      };
      cfg.streams.push(slideFile);
    }

    // do we have a stage video?
    if (this.selectedRecording.stageVideo) {
      cfg.fallbackStream = {
        'hd': this.course.folder + '/' + this.selectedRecording.stageVideo
      };

      if (this.selectedRecording.stageVideoHd) {
        cfg.fallbackStream['sd'] = cfg.fallbackStream['hd'];
        cfg.fallbackStream['hd'] = this.course.folder + '/' + this.selectedRecording.stageVideoHd;
      }
    } else {
      cfg.fallbackStream = {
        'hd': this.course.folder + '/' + this.selectedRecording.fileName
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

    // playlist
    cfg.playlist = {
      autoPlay: false,
      currentPosition: this.lecture.recordings.indexOf(recording),
      entries: this.lecture.recordings.map(x => { return {
        title: x.name,
        url: '#/lecture/' + this.course.id + '/' + x.id
      }; })
    };

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
