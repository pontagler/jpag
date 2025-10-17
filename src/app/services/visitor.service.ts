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
  const {data, error} = await supabase.rpc('get_artists_with_details')
  if(error) throw error
  return data;
}



async getArtistProfile_v1(artistId: string): Promise<any> {
  console.log('this.artists--->', artistId);
  const { data, error } = await supabase.rpc('get_artist_full_details', { p_id_artist: artistId });

  if (error) throw error;
  return data;
}


  async getArtistProfile(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_full_details', { p_id_artist: artistId });

    if (error) throw error;
    return data;
  }

async getLocationList(){
  const { data, error } = await supabase.rpc('get_location_visitor_list');

    if (error) throw error;
    return data;

}


async getUpcomingEvents(){
  const { data, error } = await supabase.rpc('get_upcoming_events');
    if (error) throw error;
    return data;

}

async getFeaturedArtist(){
  const { data, error } = await supabase.rpc('get_artists_for_home');
    if (error) throw error;
    return data;

}

  async subscribeNewsletter(payload: { name?: string | null; phone?: string | null; email: string }): Promise<{ id: number } | null> {
    const clean = {
      name: (payload.name ?? '').trim() || null,
      phone: (payload.phone ?? '').trim() || null,
      email: (payload.email ?? '').trim()
    };
    if (!clean.email) {
      throw new Error('Email is required');
    }
    const { data, error } = await supabase
      .from('newsletter')
      .insert({ name: clean.name, phone: clean.phone, email: clean.email })
      .select('id')
      .single();
    if (error) throw error;
    return data as any;
  }

routeID = signal<any>(1);
 
setRouteID(id:any){
  if (this.routeID() !== id) {
      this.routeID.set(id);
    }
}

getRouteID(){
  return this.routeID();
}

  

}