import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { filter, flatMap, map, first } from 'rxjs/operators';

import { Lecture } from './lecture';
import { LectureRecording } from './lectureRecording';
import { Course } from './course';

@Injectable()
export class LectureService {

    constructor(private http: HttpClient) { }

    lectureUrl = './assets/lecture.json';
    courseUrl = './assets/courses.json';

    getLecture(folder: string): Observable<Lecture> {
        let headers = new HttpHeaders({
            'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        return this.http.get<Lecture>(folder + '/assets/lecture.json', { headers: headers });
    }

    getCourses(): Observable<Course[]> {
        let headers = new HttpHeaders({
            'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        return this.http.get<Course[]>(this.courseUrl, { headers: headers });
    }
}
