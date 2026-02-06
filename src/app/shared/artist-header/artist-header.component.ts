import { Component, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-artist-header',
  standalone: false,
  
  templateUrl: './artist-header.component.html'
})
export class ArtistHeaderComponent {
  urlID:any;
  constructor(
    private route: ActivatedRoute, 
    public auth: AuthService, 
    private router: Router,
    private alertService: AlertService,
    private visitorService: VisitorService
  ){
    effect(() => {
       this.urlID = this.visitorService.getRouteID();
     
    });
    effect(() => {
      this.isLoggedIn = !!this.auth.userEmailAuth();
    });
  }
  
  goToArtistLogin(){
    this.router.navigate(['/artistspace']);
  }

  goToMyProfile(){
    this.router.navigate(['/artistspace/profile']);
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

async logout(){
  try {
    // Get current user info before signing out
    const currentUser = await this.auth.getCurrentUser();
    if (currentUser) {
      const userInfo = await this.auth.getUserInfo(currentUser.id);
      const rolename = userInfo?.rolename;
      
      // Sign out
      await this.auth.signOut();
      this.alertService.showAlert('Logged Out', 'You have been logged out successfully.', 'success');
      
      // Redirect based on user role
      if (rolename === 'admin') {
        this.router.navigate(['/hosts']);
      } else {
        this.router.navigate(['/artistspace']);
      }
    } else {
      // If no user found, just sign out and redirect to artist login
      await this.auth.signOut();
      this.alertService.showAlert('Logged Out', 'You have been logged out successfully.', 'success');
      this.router.navigate(['/artistspace']);
    }
  } catch (error) {
    // If error occurs, still sign out and redirect to artist login as fallback
    await this.auth.signOut();
    this.alertService.showAlert('Logged Out', 'You have been logged out successfully.', 'success');
    this.router.navigate(['/artistspace']);
  }
}


isMenuOpen: boolean = false;
isLoggedIn: boolean = false;




}
