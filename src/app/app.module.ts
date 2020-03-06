import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LectureComponent } from './lecture/lecture.component';
import { LectureService } from './shared/lecture.service';
import { PlyrModule } from 'ngx-plyr';
import { CoursesListComponent } from './courses-list/courses-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LectureComponent,
    CoursesListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    RouterModule.forRoot([
      { path: '', component: CoursesListComponent },
      { path: 'lecture/:id', component: LectureComponent }
    ], { useHash: true }),

    FlexLayoutModule,
    MatToolbarModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatTableModule,

    BrowserAnimationsModule,

    PlyrModule
  ],
  providers: [
    LectureService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
