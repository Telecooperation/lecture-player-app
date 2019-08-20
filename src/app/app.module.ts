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
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';
import { VgBufferingModule } from 'videogular2/compiled/buffering';

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
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  providers: [
    LectureService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
