import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      this.updateIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.updateIcon(false);
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateIcon(isDark);
  }

  private updateIcon(isDark: boolean) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.className = isDark 
        ? 'fas fa-sun text-yellow-400' 
        : 'fas fa-moon text-gray-800';
    }
  }

  hostRoom() {
    this.router.navigate(['/host']);
  }

  joinRoom() {
    this.router.navigate(['/join']);
  }
}
