import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  version: any = '1.2.0';

  constructor(private router: Router) {}

  goToChangelog() {
    this.router.navigate(['/changelog']);
  }
}
