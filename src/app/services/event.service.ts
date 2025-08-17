import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { ArtistService } from './artist.service';

@Injectable({
  providedIn: 'root'
})


export class EventService {

  constructor(
    private authService: AuthService,
    private artistService: ArtistService
  ) { }

  //Get Event lists
async getEventsList(){
  const {data, error} = await supabase.rpc('get_event_list')
  if(error) throw error
  return data;
}


  //Get Event details
  async getEventDetail(id:any){
    const {data, error} = await supabase.rpc('get_event_info', {id_event: id})
    if(error) throw error
    return data;
  }


}