import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  
})
export class ProfileComponent implements OnInit {

constructor(private router: Router) { }
  ngOnInit(): void {
this.isActiveTab(4);
  }

activeTab:number = 1;


 

isActiveTab(id:number){
  this.activeTab = id;
  
  switch(id){
    
    case 1: 
  console.log(id);
    this.router.navigate(['/artistspace/profile/artist']);
    break;
    case 2:
      console.log(id);
    this.router.navigate(['/artistspace/profile/instruments']); 
  break;
case 3:
  console.log(id);
    this.router.navigate(['/artistspace/profile/media']);
break;
case 4:
  console.log(id);
    this.router.navigate(['/artistspace/profile/requests']);
break;

case 5:
  console.log(id);
    this.router.navigate(['/artistspace/profile/events']);
break;
default:
    this.router.navigate(['/artistspace/profile/artist']);
}

}
}