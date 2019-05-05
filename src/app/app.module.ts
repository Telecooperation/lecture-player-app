import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatTableModule } from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatVideoModule } from 'mat-video';

import { AppComponent } from './app.component';
import { LectureComponent } from './lecture/lecture.component';
import { LectureService } from './lecture/lecture.service';

@NgModule({
  declarations: [
    AppComponent,
    LectureComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    FlexLayoutModule,
    MatToolbarModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatTableModule,

    BrowserAnimationsModule,
    MatVideoModule
  ],
  providers: [
    LectureService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
