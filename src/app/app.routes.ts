import { Routes } from '@angular/router';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ConfirmArtistComponent } from './confirm-artist/confirm-artist.component';
import { ChangelogComponent } from './changelog/changelog.component';

export const routes: Routes = [
    {path: '', redirectTo: 'visitor', pathMatch: 'full'},
    {path: 'artistspace', loadChildren: () => import('./artistspace/artistspace.module').then(m => m.ArtistspaceModule)},
    {path: 'hosts', loadChildren: () => import('./hosts/hosts.module').then(m => m.HostsModule)},
    {path:'reset', component: PasswordResetComponent},
    {path:'confirm-artist', component: ConfirmArtistComponent},
    {path:'changelog', component: ChangelogComponent},
    {path: '', loadChildren: () => import('./visitor/visitor.module').then(m => m.VisitorModule)}
]