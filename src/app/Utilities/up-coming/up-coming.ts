import { Component } from '@angular/core';

@Component({
  selector: 'app-up-coming',
  standalone: false,
  templateUrl: './up-coming.html',
  styleUrl: './up-coming.css'
})
export class UpComing {
  updates = [
    { type: '✅', text: 'Chat system optimized for faster loading.' },
    { type: '✅', text: 'User interface enhancements applied.' },
    { type: '✅', text: 'No database integration.' },
    { type: '✅', text: 'Data is cleared when the page is refreshed.' },
    { type: '✅', text: 'End-to-end high-level encryption enabled.' },
    { type: '⏳', text: 'Dark mode improvements coming soon.' },
    { type: '⏳', text: 'Mobile compatibility enhancements in progress.' },
    { type: '⏳', text: 'Media file sharing coming in version 2.0.' },
    { type: '⏳', text: 'New chat features and voice/video calls coming in version 3.0.' },
  ];
}
