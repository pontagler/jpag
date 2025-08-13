import { Routes } from '@angular/router';
import { PasswordResetComponent } from './password-reset/password-reset.component';

export const routes: Routes = [
    {path: '', redirectTo: 'visitor', pathMatch: 'full'},
    {path: 'home', loadChildren: () => import('./end-user/end-user.module').then(m => m.EndUserModule)},   
    {path: 'artistspace', loadChildren: () => import('./artistspace/artistspace.module').then(m => m.ArtistspaceModule)},
    {path: 'hosts', loadChildren: () => import('./hosts/hosts.module').then(m => m.HostsModule)},
    {path:'reset', component: PasswordResetComponent},
    {path: 'visitor', loadChildren: () => import('./visitor/visitor.module').then(m => m.VisitorModule)}
]