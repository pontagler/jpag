import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changelog',
  imports: [CommonModule, SharedModule],
  templateUrl: './changelog.component.html'
})
export class ChangelogComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  changelog = [
    {
      version: '1.2.0',
      date: '2026-02-06',
      entries: [
        {
          type: 'fix',
          title: 'Artist creation validation',
          description: 'Fixed a bug where artists were being created in the database despite validation warnings showing on screen. Validation now only requires First Name and Email. Last Name is no longer mandatory.'
        },
        {
          type: 'fix',
          title: 'Step 1 completion flag',
          description: 'Fixed the step completion flag not being set after successful artist creation, which caused the stepper to block navigation even after a successful save.'
        },
        {
          type: 'feature',
          title: 'Loading indicator on artist creation',
          description: 'Added a spinner and "Saving..." text on the Next button while artist data is being sent to the server.'
        },
        {
          type: 'feature',
          title: 'My Profile button for artists',
          description: 'Added a "My Profile" button in the artist header so logged-in artists can easily navigate back to their profile from anywhere on the site.'
        },
        {
          type: 'feature',
          title: 'My Home button for hosts',
          description: 'Added a "My Home" button in the main site header. For hosts/admins it navigates to the console, for artists it navigates to their profile.'
        }
      ]
    },
    {
      version: '1.1.2',
      date: '2026-02-05',
      entries: [
        {
          type: 'fix',
          title: 'General fixes',
          description: 'Bug fixes and improvements.'
        }
      ]
    }
  ];
}
