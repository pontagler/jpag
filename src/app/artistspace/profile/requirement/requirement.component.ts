import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ArtistService } from '../../../services/artist.service';

@Component({
  selector: 'app-requirement',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './requirement.component.html'
})
export class RequirementComponent implements OnInit{
  showEdit: boolean = false;

  constructor(
    private artistService: ArtistService
  ){

  }

  artistData:any = [];
  id_artist:any;
  userID:any;

  ngOnInit(): void {
    this.artistData = this.artistService.getArtistProfilebyID();
     this.id_artist = this.artistData.id;
     this.userID = this.artistService.getLoggedUserID();
     console.log(this.id_artist);
     this.getArtistRequirement();
  }


artistRequirement:any = [];
  async getArtistRequirement(){
    const data = await this.artistService.getArtistRequirement(this.id_artist);
    this.artistRequirement = data;
    if (Array.isArray(data) && data.length > 0) {
      const row = data[0];
      this.formData = {
        ribNumber: row?.rib || '',
        gusoNumber: row?.guso_nb || '',
        securityNumber: row?.security_nb || '',
        alergies: row?.arlergies || '',
        foodRestriction: row?.food_restriction || '',
        requirements: row?.requirement || ''
      };
    }
  }

  formData: {
    ribNumber: string;
    gusoNumber: string;
    securityNumber: string;
    alergies: string;
    foodRestriction: string;
    requirements: string;
  } = {
    ribNumber: '',
    gusoNumber: '',
    securityNumber: '',
    alergies: '',
    foodRestriction: '',
    requirements: ''
  };

  async onSubmit(): Promise<void> {
    const payload: any = {
      id_artist: this.id_artist,
      rib: this.formData.ribNumber || null,
      guso_nb: this.formData.gusoNumber || null,
      security_nb: this.formData.securityNumber || null,
      arlergies: this.formData.alergies || null,
      food_restriction: this.formData.foodRestriction || null,
      requirement: this.formData.requirements || null,

    };

    try {
      if (!Array.isArray(this.artistRequirement) || this.artistRequirement.length === 0) {
        // Insert new row
        await this.artistService.addArtistRequirement({
          ...payload,
          created_by: this.id_artist
        });
      } else {
        // Update existing row
        const existing = this.artistRequirement[0];
        await this.artistService.editArtistRequirement({
          ...payload,
          updated_by: this.id_artist,
          last_updated_on: new Date().toISOString()
        }, existing.id);
      }

      await this.getArtistRequirement();
      this.showEdit = false;
    } catch (e) {
      console.error('Failed to save artist requirement', e);
    }
  }

  maskRib(value: string | null | undefined): string {
    if (!value) return '-';
    const str = String(value);
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    const masked = 'x'.repeat(str.length - 4) + last4;
    return masked;
  }
}
