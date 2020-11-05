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

  related: LectureRecording[];

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
          this.lecture.recordings.forEach(recording => {
            recording.id = recording.name.replace(/(\s)*/g, '').toLowerCase();

            if (!recording.description) {
              recording.description = recording.name;
            }
          });

          if (lecture.recordings.length > 0) {
            const recordings = lecture.recordings
              .filter(x => x.processing === false || typeof(x.processing) === 'undefined');

            const selected = recordings.filter(x => x.id === videoId);
            this.setVideo(selected[0]);

            const idx = this.lecture.recordings.indexOf(selected[0]);
            const preceedings = recordings.slice(idx, recordings.length);
            this.related = preceedings.slice(1, Math.min(8, preceedings.length));

            if (this.related.length === 0) {
              this.related = recordings.slice(0, Math.min(8, recordings.length));
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
    const cfg = {
      'streams': [],
      'fallbackStream': null,
      'slides': [],
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

    if (this.selectedRecording.slides) {
      this.selectedRecording.slides.forEach(element => {
        cfg.slides.push({
          startPosition: element.startPosition,
          thumbnail: this.course.folder + '/' + element.thumbnail,
          ocr: element.ocr
        });
      });
    }

    // add empty slides if undefined
    if (cfg.slides === undefined) {
      cfg.slides = [];
    }

    // vtt?
    if (this.selectedRecording.vtt) {
      cfg['captions'] = [
        {
          'language': 'default',
          'url': this.course.folder + '/' + this.selectedRecording.vtt
        }
      ];
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

  humanizeDuration(sec_num: number): string {
    if (sec_num === undefined || sec_num === 0) {
      return '';
    }

    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    let hours_s, minutes_s;

    if (hours   < 10) { hours_s   = '0' + hours; }
    if (minutes < 10) { minutes_s = '0' + minutes; }
    return hours_s + 'h ' + minutes_s + 'm';
  }

}
