import { Component } from '@angular/core';
import { RouterOutlet } from '../../../../node_modules/@angular/router/index';
import { StudentNavComponent } from '../../Components/Student/student-nav/student-nav.component';
import { StudentFooterComponent } from '../../Components/Student/student-footer/student-footer.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, StudentNavComponent, StudentFooterComponent],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.scss',
})
export class StudentLayoutComponent {}
