import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-join',
  standalone: false,
  templateUrl: './join.html',
  styleUrl: './join.css'
})
export class Join {
  joinForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.joinForm = this.fb.group({
      username: ['', Validators.required],
      roomId: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.joinForm.valid) {
      this.isLoading = true; // start loading

      const username = this.joinForm.value.username.trim();
      const roomId = this.joinForm.value.roomId.toUpperCase();

      this.http.get(environment.backendUrl + `/api/room/${roomId}/exists`)
        .subscribe({
          next: (existsResponse: any) => {
            if (existsResponse.exists) {
              this.http.post(environment.backendUrl + '/api/join', { username, roomId })
                .subscribe({
                  next: () => {
                    sessionStorage.setItem('username', username);
                    this.router.navigate(['/chat', roomId]);
                    this.isLoading = false; // stop loading
                  },
                  error: (joinError) => {
                    this.isLoading = false;
                    if (joinError.status === 409) {
                      alert('This username is already taken in the room. Please choose another one.');
                    } else {
                      alert('Error joining room: ' + (joinError.error?.error || 'Unknown error'));
                    }
                  }
                });
            } else {
              this.isLoading = false;
              alert('Room not found. Please check the room ID.');
            }
          },
          error: () => {
            this.isLoading = false;
            alert('Room not found. Please check the room ID.');
          }
        });
    }
  }
}
