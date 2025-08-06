import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  standalone: false,
})
export class ArtistComponent {
constructor(private router: Router, private authSerivce: AuthService) {}

ngOnInit() {

  console.log(this.authSerivce.sigUserID());
}
}
