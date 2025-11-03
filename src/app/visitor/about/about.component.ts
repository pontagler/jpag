import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from '../../services/visitor.service';

interface TeamMember {
  name: string;
  title:string;
  image: string;
}

interface Volunteers {
  name: string;
  image: string;
}

interface PartnerLogo {
  name: string;
  image: string;
  link?: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

  constructor(private visitorService: VisitorService){
     
  }
  ngOnInit(): void {
        this.visitorService.setRouteID(5);
  }
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;
  form = {
    fname: '',
    lname: '',
    email: '',
    msg: ''
  };
  volunteers: Volunteers[] = [
    { name: 'Karine Courtois', image: 'assets/images/about/volunteer/karine.png' },
    { name: 'Véronique Dablin', image: 'assets/images/about/volunteer/veronique.png' },
    { name: 'Capucine Decker', image: 'assets/images/about/volunteer/capucine.png' },
    { name: 'Nathalie Giffard de La Jaille', image: 'assets/images/about/volunteer/nathalie.png' },

    { name: 'Nathalie Gobin', image: 'assets/images/about/volunteer/gobin.png' },
    { name: 'Véronica Gomez', image: 'assets/images/about/volunteer/gomez.png' },
    { name: 'Camille Harttiger', image: 'assets/images/about/volunteer/camille.png' },
    { name: 'Anne-Laure Hoarau', image: 'assets/images/about/volunteer/anne.png' },
    { name: 'Marielle Jeudon', image: 'assets/images/about/volunteer/marielle.png' },
    
    { name: 'Maryvone Lancigu', image: 'assets/images/about/volunteer/maryvone.png' },


    { name: 'Philippe Lançon', image: 'assets/images/about/volunteer/philippe.png' },
    { name: 'Edith Lebrun', image: 'assets/images/about/volunteer/edith.png' },

    { name: 'Antoine Pouliquen', image: 'assets/images/about/volunteer/antoine.png' },

    { name: 'Marianne Pouliquen', image: 'assets/images/about/volunteer/marianne.png' },

    { name: 'Pascale Pouliquen', image: 'assets/images/about/volunteer/pascale.png' },
    { name: 'Ronan Pouliquen', image: 'assets/images/about/volunteer/ronan.png' },
    
    { name: 'Pascale Quéré', image: 'assets/images/about/volunteer/quere.png' },
    { name: 'Françoise Sioc’han', image: 'assets/images/about/volunteer/francoise.png' },
    { name: 'Eike Tillner', image: 'assets/images/about/volunteer/eike.png' },
    { name: 'Sebastian Wulf', image: 'assets/images/about/volunteer/wulf.png' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Gabrielle Perrier', title:'Secrétaire', image: 'assets/images/about/team/gabrielle.png' },
    { name: 'Jacqueline Gaudrat', title:'Fondatrice et Trésorière', image: 'assets/images/about/team/jacqueline.png' },
    { name: 'Véronique Gaudrat', title:'Fondatrice et présidente', image: 'assets/images/about/team/veronique.png' },
    { name: 'Jean Philippe Le Calvé', title:'Communication', image: 'assets/images/about/team/jean.png' },
    { name: 'Pascale Pouliquen', title:'Organisation', image: 'assets/images/about/volunteer/pascale.png' }    
  ];

  partners: PartnerLogo[] = [
    { name: 'Partner 1', image: 'assets/images/about/partners/1.jpg' },
    { name: 'Partner 2', image: 'assets/images/about/partners/2.png' },
    { name: 'Partner 3', image: 'assets/images/about/partners/3.png' },
    { name: 'Partner 4', image: 'assets/images/about/partners/4.png' },
    { name: 'Partner 5', image: 'assets/images/about/partners/5.jpg' }
  ];

  institutionalSponsors: PartnerLogo[] = [
    { name: 'sponsors 1', image: 'assets/images/about/sponsors/1.jpg' },
    { name: 'sponsors 2', image: 'assets/images/about/sponsors/2.jpg' },
    { name: 'sponsors 3', image: 'assets/images/about/sponsors/3.png' },
    { name: 'sponsors 4', image: 'assets/images/about/sponsors/4.png' },
    { name: 'sponsors 5', image: 'assets/images/about/sponsors/5.png' },
    { name: 'sponsors 6', image: 'assets/images/about/sponsors/6.png' },
    { name: 'sponsors 7', image: 'assets/images/about/sponsors/7.jpg' },
    { name: 'sponsors 8', image: 'assets/images/about/sponsors/8.png' }
  ];

  privatePartners: PartnerLogo[] = [
    { name: 'Private Partner 1', image: 'assets/images/about/mecenes/1.png' },
    { name: 'Private Partner 2', image: 'assets/images/about/mecenes/2.jpg' },
    { name: 'Private Partner 3', image: 'assets/images/about/mecenes/3.jpg' },
    { name: 'Private Partner 4', image: 'assets/images/about/mecenes/4.png' },
    { name: 'Private Partner 5', image: 'assets/images/about/mecenes/5.jpg' },
    { name: 'Private Partner 6', image: 'assets/images/about/mecenes/6.jpg' },
    { name: 'Private Partner 7', image: 'assets/images/about/mecenes/7.png' },
    { name: 'Private Partner 8', image: 'assets/images/about/mecenes/8.png' },
    { name: 'Private Partner 9', image: 'assets/images/about/mecenes/9.jpg' },
    { name: 'Private Partner 10', image: 'assets/images/about/mecenes/10.jpg' },
    { name: 'Private Partner 11', image: 'assets/images/about/mecenes/11.png' },
    { name: 'Private Partner 12', image: 'assets/images/about/mecenes/12.png' },
    { name: 'Private Partner 13', image: 'assets/images/about/mecenes/13.png' },
  ];

  async onSubmit(evt: Event) {
    evt.preventDefault();
    if (this.isSubmitting) return;
    this.submitError = null;
    this.submitSuccess = false;
    this.isSubmitting = true;
    try {
      await this.visitorService.submitVisitorMessage({
        fname: this.form.fname,
        lname: this.form.lname,
        email: this.form.email,
        msg: this.form.msg
      });
      this.submitSuccess = true;
      this.form = { fname: '', lname: '', email: '', msg: '' };
    } catch (err: any) {
      this.submitError = err?.message || 'Une erreur est survenue.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
