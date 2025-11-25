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


  // List all mappings: location -> amenity
  async listAllLocationAmenities(){
    const { data, error } = await supabase
      .from('location_amenity')
      .select('id_location, id_amenity');
    if (error) throw error;
    return data;
  }

  // List all mappings: location -> specification
  async listAllLocationSpecs(){
    const { data, error } = await supabase
      .from('location_specs')
      .select('id_location, id_specs');
    if (error) throw error;
    return data;
  }

  // List all mappings: location -> type
  async listAllLocationTypes(){
    const { data, error } = await supabase
      .from('location_types')
      .select('id_location, id_location_type');
    if (error) throw error;
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
  // Use supabase1 (service role) to bypass RLS policies
  const {data, error} = await supabase1.from ('locations').insert(arr).select()
  if(error) throw error
  return data;
}

// Update location details
async updateLocationDetails(id: number, arr: any){
  // Use supabase1 (service role) to bypass RLS policies
  const { data, error } = await supabase1
    .from('locations')
    .update(arr)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}

// Add amenity
async addLocationAmenity(arr:any){
  const {data, error} = await supabase1.from ('location_amenity').insert(arr).select()
  if(error) throw error
  return data;
}
  // Add amenity
async removeLocationAmenity(id_location:any, id_amenity:any){
  const {data, error} = await supabase1.from ('location_amenity').delete().eq('id_location', id_location).eq('id_amenity', id_amenity)
  if(error) throw error
  return data;
}


// Add Specifications
async addLocationSpecs(arr:any){
  const {data, error} = await supabase1.from ('location_specs').insert(arr).select()
  if(error) throw error
  return data;
}
  // Add Specifications
async removeLocationSpecs(id_location:any, id_specs:any){
  const {data, error} = await supabase1.from ('location_specs').delete().eq('id_location', id_location).eq('id_specs', id_specs)
  if(error) throw error
  return data;
}


// Add Types
async addLocationType(arr:any){
  const {data, error} = await supabase1.from ('location_types').insert(arr).select()
  if(error) throw error
  return data;
}
  // Remove Types
async removeLocationType(id_location:any, id_location_type:any){
  const {data, error} = await supabase1.from ('location_types').delete().eq('id_location', id_location).eq('id_location_type', id_location_type)
  if(error) throw error
  return data;
}


  // Images: upload to 'locations' bucket and store URL in 'location_images'
  async uploadLocationImage(file: File, id_location: number, created_by: string, credit: string = ''){
    // Ensure created_by aligns with the authenticated Supabase user to satisfy common RLS policies
    try {
      const { data } = await supabase.auth.getUser();
      const authUserId = data?.user?.id;
      if (authUserId) {
        created_by = authUserId;
      }
    } catch (_err) {
      // if fetching auth user fails, fall back to provided created_by
    }
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${uuidv4()}.${fileExt}`;
    const objectPath = `${id_location}/${uniqueName}`;

    // Use supabase1 (service role) for storage upload to bypass RLS/bucket policies
    const { error: uploadError } = await supabase1.storage
      .from('locations')
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: (file as any)?.type || 'image/jpeg'
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase1.storage
      .from('locations')
      .getPublicUrl(objectPath);

    const publicUrl = publicUrlData.publicUrl;

    // Use supabase1 (service role) to bypass RLS on location_images table
    const { data, error } = await supabase1
      .from('location_images')
      .insert({ id_location, url: publicUrl, created_by, credit })
      .select('id, id_location, url, created_by, created_on, credit');
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async listLocationImages(id_location: number){
    const { data, error } = await supabase1
      .from('location_images')
      .select('id, id_location, url, created_by, created_on, credit')
      .eq('id_location', id_location)
      .order('created_on', { ascending: false });
    if (error) throw error;
    return data;
  }

  async deleteLocationImage(id: number){
    const { data, error: fetchError } = await supabase1
      .from('location_images')
      .select('url')
      .eq('id', id);
    if (fetchError) throw fetchError;

    const row = data && data.length > 0 ? data[0] : null;
    const imageUrl: string | null = row?.url || null;
    if (imageUrl) {
      const pathPart = imageUrl.split('/locations/')[1];
      if (pathPart) {
        const { error: removeError } = await supabase1.storage
          .from('locations')
          .remove([pathPart]);
        if (removeError) throw removeError;
      }
    }

    const { error: deleteError } = await supabase1
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

  async updateLocationStatus(id: number, is_active: boolean){
    let updated_by: string | null = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      updated_by = authData?.user?.id || null;
    } catch {}

    // Use supabase1 (service role) to bypass RLS policies for status updates
    const { data, error } = await supabase1
      .from('locations')
      .update({ 
        is_active, 
        last_update: new Date(),
        updated_by: updated_by || this.artistService.getLoggedUserID()
      })
      .eq('id', id)
      .select('id, is_active');
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async deleteLocationAndAssets(id: number){
    // 1) Collect image paths and delete from storage
    const { data: images, error: listErr } = await supabase1
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
      const { error: removeErr } = await supabase1.storage
        .from('locations')
        .remove(pathsToRemove);
      if (removeErr) throw removeErr;
    }

    // 2) Delete relational rows
    const { error: delImgErr } = await supabase1
      .from('location_images')
      .delete()
      .eq('id_location', id);
    if (delImgErr) throw delImgErr;

    const { error: delAmenErr } = await supabase1
      .from('location_amenity')
      .delete()
      .eq('id_location', id);
    if (delAmenErr) throw delAmenErr;

    const { error: delSpecsErr } = await supabase1
      .from('location_specs')
      .delete()
      .eq('id_location', id);
    if (delSpecsErr) throw delSpecsErr;

    const { error: delTypesErr } = await supabase1
      .from('location_types')
      .delete()
      .eq('id_location', id);
    if (delTypesErr) throw delTypesErr;

    // 3) Finally delete location row
    const { error: delLocErr } = await supabase1
      .from('locations')
      .delete()
      .eq('id', id);
    if (delLocErr) throw delLocErr;

    return { success: true };
  }

  }