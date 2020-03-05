import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LectureComponent } from './lecture/lecture.component';
import { LectureService } from './lecture/lecture.service';
import { PlyrModule } from 'ngx-plyr';

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

    PlyrModule
  ],
  providers: [
    LectureService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
