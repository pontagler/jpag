import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Importing LoginComponent
import { AuthGuard } from '../guard/auth.guard';

const routes: Routes = [
  
  {path:'login', component: LoginComponent, data: { urlID: 11 }},
  {path:'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), data: { urlID: 21 } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtistspaceRoutingModule { }
