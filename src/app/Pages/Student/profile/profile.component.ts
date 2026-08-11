import { Component, OnInit } from '@angular/core';
import { UserProfileResponse } from '../../../Core/Interfaces/Profiles/user-profile-response';
import { ProfileService } from '../../../Core/Services/Profiles/profile.service';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { EditProfileRequest } from '../../../Core/Interfaces/Profiles/edit-profile-request';
import { ProfilePageSharedComponent } from '../../../Shared/profile-page-shared/profile-page-shared.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfilePageSharedComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: UserProfileResponse = {} as UserProfileResponse;
  isLoading = false;
  isSaving = false;

  constructor(
    private readonly _profileService: ProfileService,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this._profileService
      .getProfileDetails()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<UserProfileResponse>) => {
          if (res.succeed && res.data) {
            this.user = res.data;
          }
        },
      });
  }

  editProfile(request: EditProfileRequest): void {
    this.isSaving = true;
    this._profileService
      .editProfile(this.user.id, request)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: ApplicationResult<UserProfileResponse>) => {
          if (res.succeed && res.data) {
            this.user = res.data;
            this._notifications.showSuccess(
              res.message || 'Profile updated successfully',
              'Success',
            );
          }
        },
      });
  }
}
