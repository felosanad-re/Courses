import { Component } from '@angular/core';
import { AuthFooterComponent } from '../../Components/Auth/auth-footer/auth-footer.component';
import { AuthNavComponent } from '../../Components/Auth/auth-nav/auth-nav.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, AuthNavComponent, AuthFooterComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
