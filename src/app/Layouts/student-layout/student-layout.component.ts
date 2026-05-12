import { Component } from '@angular/core';
import { StudentNavComponent } from '../../Components/Student/student-nav/student-nav.component';
import { StudentFooterComponent } from '../../Components/Student/student-footer/student-footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, StudentNavComponent, StudentFooterComponent],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.scss',
})
export class StudentLayoutComponent {}
