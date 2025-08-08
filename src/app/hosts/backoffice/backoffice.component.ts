import { Component, OnInit } from '@angular/core';
import { ArtistspaceRoutingModule } from '../../artistspace/artistspace-routing.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-backoffice',
  templateUrl: './backoffice.component.html',
  standalone: false,
})
export class BackofficeComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void { }

  // Navigation to different
  navigate(id: any) {
    switch (id) {
      case 1:
        this.router.navigate(['hosts/console/home']);
        break;

      case 2:
        this.router.navigate(['hosts/console/events']);
        break;

      case 3:
        this.router.navigate(['hosts/console/artists']);
        break;

      case 4:
        this.router.navigate(['hosts/console/locations']);
        break;

      case 5:
        this.router.navigate(['hosts/console/hosts']);
        break;

      case 6:
        this.router.navigate(['hosts/console/account']);
        break;
    }
  }
}
