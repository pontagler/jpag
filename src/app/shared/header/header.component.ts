import { Component, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-header',
  
  templateUrl: './header.component.html',
  
  standalone: false,
})
export class HeaderComponent {
urlID:any;
  constructor(
    private route: ActivatedRoute, 
    private auth: AuthService, 
    private router: Router,
    private alertService: AlertService,
    private visitorService: VisitorService
  ){
    effect(() => {
       this.urlID = this.visitorService.getRouteID();
     
    });
  }
  
  goToArtistLogin(){
    this.router.navigate(['/artistspace']);
  }
  ngOnInit() {
    // You can access route data here if needed
   
  
  }



  // CSS for the header menu items based ont he urlID
getMenuItemClass(urlID: any) {
   console.log('urlID changed function called:', this.urlID);
  
  if(urlID == this.urlID){
   return 'text-pont-green hover:text-green-700';
  }else{
    return '';
  }
}

logout(){
  this.auth.signOut();
  this.alertService.showAlert('Logged Out', 'You have been logged out successfully.', 'success');
  this.router.navigate(['/artistspace']);
}


isMenuOpen: boolean = false;





}
