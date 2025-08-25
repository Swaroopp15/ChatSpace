import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-enter-name',
  standalone: false,
  templateUrl: './enter-name.html',
  styleUrl: './enter-name.css'
})
export class EnterName implements OnInit {
  joinForm!: FormGroup;
  roomId!: string;
  isDark = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.joinForm = this.fb.group({
      username: ['', Validators.required],
    });

    this.roomId = this.route.snapshot.paramMap.get('roomId') || 'XXXXXX';
    this.isDark = localStorage.getItem('theme') === 'dark';
    this.initParticles();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.initParticles();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  joinRoom() {
    if (this.joinForm.valid) {
      const username = this.joinForm.value.username;
      this.router.navigate([`/chat/${this.roomId}`], { queryParams: { username } });
    }
  }

  initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 40 + 10;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 15 + 10;

      particle.className = 'absolute rounded-full opacity-50';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
      particle.style.background = this.isDark
        ? 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(139,92,246,0.2) 100%)'
        : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.2) 100%)';
      container.appendChild(particle);
    }
  }
}