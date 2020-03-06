import { Component, OnInit } from '@angular/core';
import { Course } from '../shared/course';
import { LectureService } from '../shared/lecture.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit {
  public courses: Course[] = [];

  dataSource: MatTableDataSource<Course>;
  displayedColumns = ['name', 'semester'];

  constructor(private lectureService: LectureService) { }

  ngOnInit(): void {
    this.lectureService.getCourses().subscribe(x => {
      this.courses = x;
      this.dataSource = new MatTableDataSource(this.courses);
    });
  }
}
