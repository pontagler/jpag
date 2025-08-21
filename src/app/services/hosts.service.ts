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

      async uploadHostLogo(hostId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const filePath = `${hostId}/logo-${Date.now()}.${fileExt}`;
        // Use service-role client for storage operations if RLS or storage policies block anon
        const { data, error } = await supabase1.storage.from('hosts').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        if (error) throw error;
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


      
    

    }