import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-host',
  standalone: false,
  templateUrl: './host.html',
  styleUrl: './host.css'
})
export class Host {
  hostForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.hostForm = this.fb.group({
      username: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.hostForm.valid) {
      this.isLoading = true;
      const username = this.hostForm.value.username;

      this.http.post(environment.backendUrl + '/api/host', { username })
        .subscribe({
          next: (response: any) => {
            sessionStorage.setItem('username', response.username);
            this.router.navigate(['/chat', response.roomId]);
          },
          error: (error) => {
            alert('Error creating room: ' + (error.error?.error || 'Unknown error'));
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }
}
