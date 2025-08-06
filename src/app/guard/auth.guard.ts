import { CanActivate, Router } from '@angular/router';
import { Injectable, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

 canActivate():any  {
this.userEmailAuth = signal<boolean | null>(null);
const emailVerified = this.authService.userEmailAuth();
console.log(this.authService.sigUserID())

if(!emailVerified){
  this.router.navigate(['/artistspace/login']);
  return false;
}else{

}
}
  userEmailAuth() {
    throw new Error('Method not implemented.');
  }

}
