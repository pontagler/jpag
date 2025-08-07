// auth.service.ts
import { Injectable, signal, effect } from '@angular/core';
import { supabase } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private session$ = new BehaviorSubject<any>(null);
  private sessionReady$ = new BehaviorSubject<boolean>(false);

  // Signal to hold whether the user's email is verified
  userEmailAuth = signal<boolean | null>(null);
  sigUserID = signal<string | null>(null);


  // BehaviorSubject to emit signal changes as observable
  private userEmailAuthSubject = new BehaviorSubject<boolean | null>(null);

  constructor() {
    // On app load, restore session from Supabase and update state
  };



  isLoggedIn(): boolean {
    return !!this.session$.getValue();
  }

  // Sign in and update signal/state
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    // Fetch additional user info from your DB view/table
    const userInfo = await this.getUserInfo(data.user.id);

    // Update email verified signal explicitly here
    this.userEmailAuth.set(true);
    this.sigUserID.set(data.user.id);

    const user = {
      ...data.user,
      ...userInfo
    };



    return user;
  }

  async signOut() {
     const signout = await supabase.auth.signOut();
     console.log('Sign out successful:', signout);
    // Reset signals on logout
    this.userEmailAuth.set(false); // Reset signal on logout
  }

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  // Custom query to your DB to get additional user info
  async getUserInfo(id_user: string) {
    const { data, error } = await supabase
      .from('vw_user_profile_role')
      .select('*')
      .eq('id_user', id_user)
      .single();
    if (error) throw error;
    return data;
  }

async changePassword(new_password:any){
 const {data, error} = await supabase.auth.updateUser({
  password: new_password
 })

 if (error) throw error
 return data;


}

}
