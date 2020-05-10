import { Component, OnInit } from '@angular/core';
import { Course } from '../shared/course';
import { LectureService } from '../shared/lecture.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit {
  public courses: Course[] = [];

  currentCoursesSource: MatTableDataSource<Course>;
  previousCoursesSource: MatTableDataSource<Course>;

  displayedColumns = ['name', 'semester'];

  constructor(private lectureService: LectureService,
    private router: Router) { }

  ngOnInit(): void {
    this.lectureService.getCourses().subscribe(x => {
      this.courses = x;

      this.currentCoursesSource = new MatTableDataSource(this.courses.filter(course => course.current));
      this.previousCoursesSource = new MatTableDataSource(this.courses.filter(course => !course.current));
    });
  }

  doNavigate(course: Course): void {
    if (course.url) {
      window.location.href = course.url;
    } else {
      this.router.navigate(['/lecture', course.id]);
    }
  }
}
