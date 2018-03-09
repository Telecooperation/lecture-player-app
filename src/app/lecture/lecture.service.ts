import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Lecture } from './lecture';
import { LectureRecording } from './lectureRecording';

@Injectable()
export class LectureService {

    constructor(private http: HttpClient) { }

    lectureUrl = './assets/lecture.json';
    getLecture(): Observable<Lecture> {
        return this.http.get<Lecture>(this.lectureUrl);
    }

}
