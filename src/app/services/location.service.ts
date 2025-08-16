import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { ArtistService } from './artist.service';


@Injectable({
    providedIn: 'root'
  })

  export class LocationService {
    constructor(
        private authService: AuthService,
        private artistService: ArtistService
      ) { }

//Get all the artists Requests
async getallLocation(){
    const {data, error} = await supabase.from('locations').select()
    if(error) throw error
    return data;
  }

  //Get all the artists Requests
async getSysAmenity(){
    const {data, error} = await supabase.from('sys_location_amenity').select()
    if(error) throw error
    return data;
  }

  
  //Get all the specification Requests
async getSysSpecs(){
    const {data, error} = await supabase.from('sys_location_specs').select()
    if(error) throw error
    return data;
  }


    //Get all the types Requests
async getSysTypes(){
    const {data, error} = await supabase.from('sys_location_types').select()
    if(error) throw error
    return data;
  }

// Add locations Details

async addLocationDetails(arr:any){
  const {data, error} = await supabase.from ('locations').insert(arr).select()
  if(error) throw error
  return data;
}

// Add amenity
async addLocationAmenity(arr:any){
  const {data, error} = await supabase.from ('location_amenity').insert(arr).select()
  if(error) throw error
  return data;
}
  // Add amenity
async removeLocationAmenity(id_location:any, id_amenity:any){
  const {data, error} = await supabase.from ('location_amenity').delete().eq('id_location', id_location).eq('id_amenity', id_amenity)
  if(error) throw error
  return data;
}


// Add Specifications
async addLocationSpecs(arr:any){
  const {data, error} = await supabase.from ('location_specs').insert(arr).select()
  if(error) throw error
  return data;
}
  // Add Specifications
async removeLocationSpecs(id_location:any, id_specs:any){
  const {data, error} = await supabase.from ('location_specs').delete().eq('id_location', id_location).eq('id_specs', id_specs)
  if(error) throw error
  return data;
}


// Add Types
async addLocationType(arr:any){
  const {data, error} = await supabase.from ('location_types').insert(arr).select()
  if(error) throw error
  return data;
}
  // Remove Types
async removeLocationType(id_location:any, id_type:any){
  const {data, error} = await supabase.from ('location_types').delete().eq('id_location', id_location).eq('id_type', id_type)
  if(error) throw error
  return data;
}


  // Images: upload to 'locations' bucket and store URL in 'location_images'
  async uploadLocationImage(file: File, id_location: number, created_by: string){
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${uuidv4()}.${fileExt}`;
    const objectPath = `${id_location}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from('locations')
      .upload(objectPath, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('locations')
      .getPublicUrl(objectPath);

    const publicUrl = publicUrlData.publicUrl;

    const { data, error } = await supabase
      .from('location_images')
      .insert({ id_location, url: publicUrl, created_by })
      .select('id, id_location, url, created_by, created_on')
      .single();
    if (error) throw error;
    return data;
  }

  async listLocationImages(id_location: number){
    const { data, error } = await supabase
      .from('location_images')
      .select('id, id_location, url, created_by, created_on')
      .eq('id_location', id_location)
      .order('created_on', { ascending: false });
    if (error) throw error;
    return data;
  }

  async deleteLocationImage(id: number){
    const { data: row, error: fetchError } = await supabase
      .from('location_images')
      .select('url')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const imageUrl: string | null = row?.url || null;
    if (imageUrl) {
      const pathPart = imageUrl.split('/locations/')[1];
      if (pathPart) {
        const { error: removeError } = await supabase.storage
          .from('locations')
          .remove([pathPart]);
        if (removeError) throw removeError;
      }
    }

    const { error: deleteError } = await supabase
      .from('location_images')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;
    return { success: true };
  }


  async getLocationInfo(id:any){
    const {data, error} = await supabase.rpc('get_location_profile', {location_id: id});
    if(error) throw error
    return data;
  }

  async updateLocationStatus(id: number, status: number){
    const { data, error } = await supabase
      .from('locations')
      .update({ 
        status, 
        last_updated_on: new Date(),
        updated_by: this.artistService.getLoggedUserID()
      })
      .eq('id', id)
      .select('id, status')
      .single();
    if (error) throw error;
    return data;
  }

  async deleteLocationAndAssets(id: number){
    // 1) Collect image paths and delete from storage
    const { data: images, error: listErr } = await supabase
      .from('location_images')
      .select('id, url')
      .eq('id_location', id);
    if (listErr) throw listErr;

    const pathsToRemove: string[] = [];
    if (Array.isArray(images)) {
      for (const row of images) {
        const imageUrl: string | null = (row as any)?.url || null;
        if (imageUrl && imageUrl.includes('/locations/')) {
          const pathPart = imageUrl.split('/locations/')[1];
          if (pathPart) pathsToRemove.push(pathPart);
        }
      }
    }

    if (pathsToRemove.length > 0) {
      const { error: removeErr } = await supabase.storage
        .from('locations')
        .remove(pathsToRemove);
      if (removeErr) throw removeErr;
    }

    // 2) Delete relational rows
    const { error: delImgErr } = await supabase
      .from('location_images')
      .delete()
      .eq('id_location', id);
    if (delImgErr) throw delImgErr;

    const { error: delAmenErr } = await supabase
      .from('location_amenity')
      .delete()
      .eq('id_location', id);
    if (delAmenErr) throw delAmenErr;

    const { error: delSpecsErr } = await supabase
      .from('location_specs')
      .delete()
      .eq('id_location', id);
    if (delSpecsErr) throw delSpecsErr;

    const { error: delTypesErr } = await supabase
      .from('location_types')
      .delete()
      .eq('id_location', id);
    if (delTypesErr) throw delTypesErr;

    // 3) Finally delete location row
    const { error: delLocErr } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    if (delLocErr) throw delLocErr;

    return { success: true };
  }

  }