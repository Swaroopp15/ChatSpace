import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OverlayModule } from '@angular/cdk/overlay';

import { Home } from './Components/home/home';
import { Host } from './Components/host/host';
import { Join } from './Components/join/join';
import { EnterName } from './Components/enter-name/enter-name';
import { Chat } from './Components/chat/chat';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EmojiPicker } from './Utilits/emoji-picker/emoji-picker';
import { MediaDialog } from './Utilits/media-dialog/media-dialog';
import { PickerModule, } from '@ctrl/ngx-emoji-mart';
import { UpComing } from './Utilities/up-coming/up-coming';
import { Header } from './Utilities/header/header';


@NgModule({
  declarations: [
    App,
    Home,
    Host,
    Join,
    EnterName,
    Chat,
    EmojiPicker,
    MediaDialog,
    UpComing,
    Header,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OverlayModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    PickerModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection()
  ],
  bootstrap: [App]
})
export class AppModule { }
