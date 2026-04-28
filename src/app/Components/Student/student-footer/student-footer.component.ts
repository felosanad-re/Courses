import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './student-footer.component.html',
  styleUrl: './student-footer.component.scss',
})
export class StudentFooterComponent {
  currentYear = new Date().getFullYear();
}
