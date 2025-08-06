import { Injectable, signal, effect } from '@angular/core';
import { supabase } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';


  export interface ArtistRequest {
  id_artist: string;
  id_req_type: number;
  title: string;
  instrument: string[];
  short_desc: string;
  long_desc: string;
  propose_date: string[]; // or Date[] if using TIMESTAMPTZ
  id_host: string;
  status?: number;
}


@Injectable({
  providedIn: 'root'
})


export class ArtistService {

  

  constructor() { }

//Fetch artist profile by ID
async getArtistProfile(artistId: string): Promise<any> {
  const { data, error } = await supabase.rpc('get_artist_profile', {artist_id: artistId});


  if (error) throw error;
  return data;
}


  private artistProfileID = signal<string | null>(null);
  private artistProfile = signal<any>(null);
  private artistID = signal<string | null>(null);

  setArtistProfileID(id: string) {
    this.artistProfileID.set(id);
  }

    setArtistID(id: string) {
    this.artistID.set(id);
  }
  getArtistID() {
    return this.artistID();
  }


  getArtistProfileID() {
    return this.artistProfileID();
  }

  setArtistProfile(profile: any) {
    this.artistProfile.set(profile);
  }

  getArtistProfilebyID() {
    return this.artistProfile();
  }


  getInstruments(): Observable<any[]> {
    return new Observable(observer => {
      supabase
        .from('sys_instruments')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            observer.error(error);
          } else {
            observer.next(data);
            observer.complete();
          }
        });
    });
  }


async createArtistRequest(request: ArtistRequest) {
  const { data, error } = await supabase
    .from('artist_request')
    .insert([{
      id_artist: request.id_artist,
      id_req_type: request.id_req_type,
      title: request.title,
      instrument: request.instrument,
      short_desc: request.short_desc,
      long_desc: request.long_desc,
      propose_date: request.propose_date,
      id_host: request.id_host,
      status: request.status ?? 1
    }])
    .select('id');  // 👈 This line is required to return the generated ID

  if (error) throw error;
  return data?.[0]; // return just the inserted row (optional)
}





}
