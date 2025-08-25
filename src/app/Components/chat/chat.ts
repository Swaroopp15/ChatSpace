import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../Service/socket-service';
import { MediaDialog } from '../../Utilits/media-dialog/media-dialog';
import { environment } from '../../../environments/environment';

interface Message {
  role: string;
  msg: string;
  time: string;
  localId?: string;
}

interface Media {
  username: string;
  name: string;
  url: string;
  ext: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('usersPanelRef') private usersPanelRef!: ElementRef;

  roomId = '';
  username = '';
  messageForm: FormGroup;
  messages: Message[] = [];
  mediaItems: Media[] = [];
  users: string[] = [];
  typingUsers: string[] = [];
  isTyping = false;
  typingTimeout: any;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'connecting';
  isSending = false;

  // Settings
  showSettingsPanel = false;
  currentTheme = 'dark';
  currentLanguage = 'en';

  private localMessageIds = new Set<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private socketService: SocketService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.username = sessionStorage.getItem('username') || '';

    if (!this.username) {
      this.router.navigate(['/']);
      return;
    }

    // Theme
    const savedTheme = localStorage.getItem('theme');
    this.currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
    this.setTheme(this.currentTheme);

    this.checkConnectionStatus();
    this.socketService.joinRoom({ room: this.roomId, username: this.username });
    this.setupSocketListeners();
  }

  private checkConnectionStatus() {
    if (this.socketService.getConnectionStatus()) {
      this.connectionStatus = 'connected';
    } else {
      this.connectionStatus = 'disconnected';
      setTimeout(() => this.checkConnectionStatus(), 2000);
    }
  }

  private setupSocketListeners() {
    this.subscriptions.push(
      // Text messages
      this.socketService.onReceiveMessage().subscribe((message: Message) => {
        if (!this.localMessageIds.has(this.getMessageId(message))) {
          this.messages.push(message);
          this.scrollToBottom(true);
          this.cdRef.detectChanges();
        }
      }),

      // Media from server
      this.socketService.onReceiveMedia().subscribe((media: Media) => {
        this.mediaItems.push(media);
        this.scrollToBottom(true);
        this.cdRef.detectChanges();
      }),

      // Users list
      this.socketService.onUpdateUsers().subscribe((users: string[]) => {
        this.users = users;
        this.cdRef.detectChanges();
      }),

      // Typing
      this.socketService.onShowTyping().subscribe((data: any) => {
        if (!this.typingUsers.includes(data.by)) {
          this.typingUsers.push(data.by);
          this.cdRef.detectChanges();

          setTimeout(() => {
            this.typingUsers = this.typingUsers.filter(u => u !== data.by);
            this.cdRef.detectChanges();
          }, 2500);
        }
      }),

      this.socketService.onHideTyping().subscribe(() => {
        this.typingUsers = [];
        this.cdRef.detectChanges();
      })
    );
  }

  private getMessageId(message: Message): string {
    return `${message.role}-${message.msg}-${message.time}`;
  }

  private generateLocalId(): string {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  async sendMessage() {
    if (this.messageForm.valid && !this.isSending) {
      this.isSending = true;
      const messageText = this.messageForm.value.message;

      try {
        const localId = this.generateLocalId();
        const newMessage: Message = {
          role: this.username,
          msg: messageText,
          time: this.getCurrentTime(),
          localId
        };

        this.localMessageIds.add(this.getMessageId(newMessage));
        this.messages.push(newMessage);
        this.messageForm.reset();
        this.stopTyping();
        this.scrollToBottom(true);
        this.cdRef.detectChanges();

        await this.socketService.sendMessage({
          room: this.roomId,
          username: this.username,
          msg: messageText
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messages = this.messages.filter(m => m.localId === undefined);
        alert('Failed to send message. Please try again.');
      } finally {
        this.isSending = false;
        this.cdRef.detectChanges();
      }
    }
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socketService.typing({ room: this.roomId, username: this.username });
    }
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.stopTyping(), 1200);
  }

  stopTyping() {
    this.isTyping = false;
    clearTimeout(this.typingTimeout);
    this.socketService.stopTyping({ room: this.roomId });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('room', this.roomId);
    formData.append('username', this.username);

    const ext = (file.name.split('.').pop() || '').toLowerCase();

    // Temporary optimistic preview while uploading
    const tempMedia: Media = {
      username: this.username,
      name: file.name,
      url: URL.createObjectURL(file),
      ext,
      time: this.getCurrentTime()
    };
    this.mediaItems.push(tempMedia);
    this.scrollToBottom(true);

    // Upload to backend; backend will broadcast "receive_media" to the room
    this.http.post(environment.backendUrl + '/upload', formData).subscribe({
      next: (response: any) => {
        // Remove the temporary preview
        this.mediaItems = this.mediaItems.filter(m => m !== tempMedia);

        // Add confirmed media directly from server response
        if (response?.url) {
          const confirmedMedia: Media = {
            username: this.username,
            name: response.name || file.name,
            url: response.url,
            ext,
            time: response.time || this.getCurrentTime()
          };
          this.mediaItems.push(confirmedMedia);
          this.scrollToBottom(true);
          this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('File upload failed', error);
        alert('File upload failed: ' + (error.error?.error || 'Unknown error'));
        this.mediaItems = this.mediaItems.filter(m => m !== tempMedia);
      }
    });

    // Reset the input so selecting the same file again re-triggers change
    this.fileInput.nativeElement.value = '';
  }

  openMediaDialog(media: Media) {
    this.dialog.open(MediaDialog, {
      data: media,
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  isImage(ext: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'avif'].includes(ext);
  }
  isVideo(ext: string): boolean {
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
  }
  isAudio(ext: string): boolean {
    return ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  leaveRoom() {
    this.router.navigate(['/']);
  }

  scrollToBottom(smooth = false): void {
    try {
      setTimeout(() => {
        if (this.messageContainer?.nativeElement) {
          this.messageContainer.nativeElement.scrollTo({
            top: this.messageContainer.nativeElement.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
          });
        }
      }, 100);
    } catch (err) {
      console.error(err);
    }
  }

  // Sidebar (mobile)
  toggleUsersPanel() {
    if (this.usersPanelRef?.nativeElement) {
      this.usersPanelRef.nativeElement.classList.toggle('-translate-x-full');
    }
  }

  // Settings
  openSettings() {
    this.showSettingsPanel = true;
  }
  closeSettings() {
    this.showSettingsPanel = false;
  }
  setTheme(theme: string) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.renderer.removeClass(document.body, 'dark');
    if (theme === 'dark') this.renderer.addClass(document.body, 'dark');
  }
  setLanguage(event: any) {
    this.currentLanguage = event.target.value;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.localMessageIds.clear();
    this.socketService.disconnect();
  }
}
