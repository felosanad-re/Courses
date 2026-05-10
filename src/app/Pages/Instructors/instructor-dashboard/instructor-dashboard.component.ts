import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstructorsService } from '../../../Core/Services/Instructors/instructors.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseResponseForInstructor } from '../../../Core/Interfaces/Instructors/course-response-for-instructor';

interface StatsCard {
  icon: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
}

interface Activity {
  id: number;
  icon: string;
  message: string;
  time: string;
  type: 'enrollment' | 'review' | 'payment' | 'course';
}

interface Review {
  id: number;
  studentName: string;
  avatar: string;
  rating: number;
  comment: string;
  course: string;
  date: string;
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss',
})
export class InstructorDashboardComponent implements OnInit {
  instructorName = '';
  isLoading = true;
  courses: CourseResponseForInstructor[] = [];

  statsCards: StatsCard[] = [
    {
      icon: 'pi-book',
      title: 'Total Courses',
      value: 0,
      change: '+0 this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-users',
      title: 'Total Students',
      value: '0',
      change: '+0 this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-wallet',
      title: 'Total Revenue',
      value: '$0',
      change: '+0% this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-star',
      title: 'Average Rating',
      value: 0,
      change: '+0 this month',
      changeType: 'positive',
    },
  ];

  recentActivities: Activity[] = [
    {
      id: 1,
      icon: 'pi-user-plus',
      message: 'New student enrolled in Advanced Mathematics',
      time: '2 min ago',
      type: 'enrollment',
    },
    {
      id: 2,
      icon: 'pi-star',
      message: 'New 5-star review on Physics for Beginners',
      time: '15 min ago',
      type: 'review',
    },
    {
      id: 3,
      icon: 'pi-wallet',
      message: 'Payment received: $49.99',
      time: '1 hour ago',
      type: 'payment',
    },
    {
      id: 4,
      icon: 'pi-video',
      message: 'New lecture added to Calculus Fundamentals',
      time: '3 hours ago',
      type: 'course',
    },
    {
      id: 5,
      icon: 'pi-user-plus',
      message: '5 new students enrolled',
      time: '5 hours ago',
      type: 'enrollment',
    },
  ];

  reviews: Review[] = [
    {
      id: 1,
      studentName: 'Sarah Ahmed',
      avatar: 'S',
      rating: 5,
      comment:
        'Excellent explanation! The course helped me understand complex concepts easily.',
      course: 'Advanced Mathematics',
      date: '2 days ago',
    },
    {
      id: 2,
      studentName: 'Mohamed Ali',
      avatar: 'M',
      rating: 4,
      comment: 'Great course overall. Would love more practice problems.',
      course: 'Physics for Beginners',
      date: '3 days ago',
    },
    {
      id: 3,
      studentName: 'Fatima Hassan',
      avatar: 'F',
      rating: 5,
      comment: 'Best instructor! Very patient and clear in explanations.',
      course: 'Calculus Fundamentals',
      date: '1 week ago',
    },
  ];

  constructor(
    private readonly _instructorsService: InstructorsService,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadCourses();
  }

  loadUserName(): void {
    if (isPlatformBrowser(this._platformId)) {
      const username = localStorage.getItem('username');
      this.instructorName = username || 'Instructor';
    }
  }

  loadCourses(): void {
    this._instructorsService.getAllCourses().subscribe({
      next: (response: ApplicationResult<CourseResponseForInstructor[]>) => {
        if (response.succeed && response.data) {
          this.courses = response.data;
          this.updateStats();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  updateStats(): void {
    this.statsCards[0].value = this.courses.length;
    this.statsCards[1].value = '0';
    this.statsCards[3].value = 0;
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }
}
