import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})


export class AccountService {

  constructor(
    private authService: AuthService
  ) { }

async getAccountList(){
  const {data, error} = await supabase.from('user_profile').select().eq('id_role', '2f7d3ac7-6144-4b1a-9093-3c1a1b0d5270')
  if(error) throw error
  return data;
}

async getAccountById(id_user: string){
  // Prefer view with rolename
  const { data, error } = await supabase
    .from('vw_user_profile_role')
    .select('*')
    .eq('id_user', id_user)
    .single();
  if (error) throw error;
  return data;
}



  /**
   * Create service to add new auth data in storage
   */

async createNewAdmin(arr: any) {

    console.log(arr);

  try {
    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: arr.email,
      password: arr.password
    });

    if (error) throw error;
    if (!data?.user) throw new Error('User not created');

    let id_user = data.user.id;

    // 2. Store user details in user_profile table
    let dataArray = {
      id: uuidv4(),  // your own UUID for user_profile row
      id_user: id_user,  // auth.users.id
      id_role: '2f7d3ac7-6144-4b1a-9093-3c1a1b0d5270', // default role (Admin)
      first_name: arr.fname,
      last_name: arr.lname,
      email: arr.email,
      phone: arr.phone,
      city: arr.city,       // ✅ fixed typo ("ciity")
      proviance: arr.province, // ✅ fixed typo ("proviance")
      country: arr.country,
      created_by: arr.id_logged,
      status: 1
    };

    const { data: inserted, error: insertError } = await supabase
      .from('user_profile')
      .insert(dataArray)
      .select(); // 👈 return inserted row(s)

    if (insertError) throw insertError;

    return inserted;
  } catch (err) {
    console.error('Error creating new admin:', err);
    throw err;
  }
}




}