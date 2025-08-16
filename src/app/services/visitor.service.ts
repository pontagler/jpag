import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})


export class VisitorService {

  constructor(
    private authService: AuthService
  ) { }

async getArtistForVisitor(){
  const {data, error} = await supabase.rpc('get_artists_for_visitors')
  if(error) throw error
  return data;
}


  async getArtistProfile(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_profile_v1', { artist_id: artistId });

    if (error) throw error;
    return data;
  }

async getLocationList(){
  const { data, error } = await supabase.rpc('get_location_visitor_list');

    if (error) throw error;
    return data;

}



  

}