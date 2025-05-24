import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HtmlViewerComponent } from './components/html-viewer/html-viewer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'view/:filename', component: HtmlViewerComponent },
  { path: '**', redirectTo: '' }
];