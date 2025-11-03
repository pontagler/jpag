import { Component, effect, OnInit } from '@angular/core';
import { ArtistService } from '../../../services/artist.service';
import { NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule, TitleCasePipe],
  templateUrl: './instruments.component.html',

})
export class InstrumentsComponent implements OnInit {

  constructor(
    private artistService: ArtistService,
    private alertService: AlertService
  ) {


    effect(() => {
      this.loggedUser = this.artistService.getArtistProfileID();
      this.artistData = this.artistService.getArtistProfilebyID();
      this.artistInstrument = this.artistData.instruments;
      this.getInstrumentName();
    });


  }
artistData:any = [];
id_artist:any;
artistInstrument:any = [];
loggedUser:any;
  ngOnInit(): void {
    this.getInstrumentName();
     this.artistData = this.artistService.getArtistProfilebyID();
     this.id_artist = this.artistData.id;
      this.artistInstrument = this.artistData.instruments;
        this.loggedUser = this.artistService.getArtistProfileID();
      console.log(this.artistData)

  }

  artistProfile: any = [];
  showEdit: boolean = false;
  selectedInstrumentID: string = '0';
  allInstruments: any = [];


  async getInstrumentName() {

    console.log('Fetching instruments...');
    this.artistService.getInstruments().subscribe({
      next: (data: any) => {
        this.allInstruments = data;
       this.allInstruments = this.allInstruments.filter(
         (  ai: { id: any; }) => !this.artistInstrument.some((ai2: { id_instrument: any; }) => ai2.id_instrument === ai.id)
);



      },
      error: (err) => {
        console.error('Error fetching instruments:', err);
      },
    });
  }


  onChangeInst(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedInstrumentID = selectElement?.value ?? '0';
  }

  /**
   * Adds selected instrument. Currently a stub to satisfy template bindings.
   */
  addIntrumentData(id:any): void {
    let arr = {
      id_artist: this.id_artist,
      id_instrument: id,
      created_by: this.loggedUser,
      created_on     : new Date(),
      last_update  : new Date() ,
      updated_by: this.loggedUser
    }

    try{

      this.artistService.addInstruments(arr).then(()=>{
        let row  = this.allInstruments.find((item: { id: any; }) => item.id == parseInt(id))
        let xrow = {id_inst: null, id_artist: this.id_artist, inst_color : row.color, instrument: row.name, id_instrument: id};
        this.artistInstrument.push(xrow);

        this.allInstruments = this.allInstruments.filter((item : {id:any})=>item.id !== parseInt(id));





        this.alertService.showAlert("Successful Added", 'Instrument is added', 'success');

      })
      

    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
    this.artistService.addInstruments





  }


  removeInstrument(id: any) {
    try {
      const instObj: any = this.artistInstrument.find((item: any) => (item.id === id) || (item.id_instrument == id));
      const instId: any = instObj && instObj.id_instrument ? instObj.id_instrument : id;
      this.artistService.delInstruments(this.id_artist, instId).then(() => {
        this.artistInstrument = this.artistInstrument.filter((item: any) => {
          const key = (item.id_instrument !== undefined && item.id_instrument !== null) ? item.id_instrument : item.id;
          return key != instId;
        });
        const numericId = Number(instId);
        const existsInAll = this.allInstruments.some((item: any) => item.id == numericId);
        if (!existsInAll && instObj) {
          const sysRow = { id: numericId, name: instObj.instrument, color: instObj.inst_color };
          this.allInstruments.push(sysRow);
        }
        this.alertService.showAlert('Successful', 'Instrument removed', 'success');
      }).catch((error: any) => {
        this.alertService.showAlert('Internal Error', error.message || 'Failed to remove instrument', 'error');
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }






}
