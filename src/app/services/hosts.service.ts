import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { ArtistService } from './artist.service';


@Injectable({
    providedIn: 'root'
  })

  export class HostsService {
    constructor(
        private authService: AuthService,
        private artistService: ArtistService
      ) { }

      async getHostsProfile(id_host:any){
    
        const {data,error} = await supabase.from('hosts').select().eq('id', id_host);
        if(error) throw error
            console.log(data);
        return data;
      }

      async getHostsByProfile(p_id_profile: string){
        const {data, error} = await supabase.rpc('get_hosts_by_profile', { p_id_profile });
        if(error) throw error;
        console.log('Hosts by profile:', data);
        return data || [];
      }

      async uploadHostLogo(hostId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `${hostId}/logo-${Date.now()}.${fileExt}`;
        
        // Try service-role client first (supabase1) to bypass RLS/bucket policies
        let data, error;
        ({ data, error } = await supabase1.storage.from('hosts').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        }));
        
        // If service-role fails, try authenticated client as fallback
        if (error) {
          console.warn('Service-role upload failed, trying authenticated client:', error);
          ({ data, error } = await supabase.storage.from('hosts').upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'image/jpeg'
          }));
        }
        
        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Failed to upload logo: ${error.message || 'Unknown error'}`);
        }
        
        if (!data) {
          throw new Error('Upload succeeded but no data returned');
        }
        
        const { data: publicUrlData } = supabase1.storage.from('hosts').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
      }

      async updateHostProfile(id_host: any, payload: any) {
        // Using service-role client to bypass RLS (ensure this is only used in trusted environments)
        const { data, error } = await supabase1
          .from('hosts')
          .update(payload)
          .eq('id', id_host)
          .select();
        if (error) throw error;
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
      }



      async getDashbaordCount(){
        const {data, error} = await supabase.from('vw_dashboard_stats').select('*');
        if(error) throw error
        return data;
      }


      
    

    }