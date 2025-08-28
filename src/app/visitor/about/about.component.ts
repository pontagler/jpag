import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

  constructor(private visitorService: VisitorService){
     
  }
  ngOnInit(): void {
        this.visitorService.setRouteID(5);
  }
  teamMembers = [
    {
      name: 'Jean-Pierre',
      role: 'Founder & Director',
      image: 'assets/images/profile/user-b.png',
      bio: 'Passionate about preserving and promoting Breton culture through music.'
    },
    {
      name: 'Marie Claire',
      role: 'Artistic Coordinator',
      image: 'assets/images/profile/user-b.png',
      bio: 'Curates our diverse lineup of talented artists and immersive cultural events.'
    },
    {
      name: 'Yannick Le Roux',
      role: 'Community Manager',
      image: 'assets/images/profile/user-b.png',
      bio: 'Connects with our audience and ensures every event is a memorable experience.'
    }
  ];

  onSubmit(evt: Event) {
    evt.preventDefault();
  }
}
