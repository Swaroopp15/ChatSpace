import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-media-dialog',
  standalone: false,
  templateUrl: './media-dialog.html',
  styleUrl: './media-dialog.css'
})
export class MediaDialog {

 constructor(
    public dialogRef: MatDialogRef<MediaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  isImage(ext: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
  }

  isVideo(ext: string): boolean {
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
  }

  isAudio(ext: string): boolean {
    return ['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(ext);
  }
}
