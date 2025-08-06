import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-header',
  
  templateUrl: './header.component.html',
  
  standalone: false,
})
export class HeaderComponent {

  constructor(
    private route: ActivatedRoute, 
    private auth: AuthService, 
    private router: Router,
    private alertService: AlertService
  ){}

  ngOnInit() {
    // You can access route data here if needed
    this.urlID = this.route.snapshot.data['urlID'];
  }

  urlID:any; // Default value, can be set dynamically based on route or other logic

  // CSS for the header menu items based ont he urlID
getMenuItemClass(urlID: any) {
  
  if(urlID == this.urlID){
   return 'border-b-2 border-solid  border-pont-green text-pont-green hover:text-green-700';
  }else{
    return '';
  }
}

logout(){
  this.auth.signOut();
  this.alertService.showAlert('Logged Out', 'You have been logged out successfully.', 'success');
  this.router.navigate(['/artistspace/login']);
}


isMenuOpen: boolean = false;





}
