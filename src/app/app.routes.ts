import { Routes } from '@angular/router';
import {ContenuComponent} from "./components/contenu/contenu.component";
import {DetailComponent} from "./components/detail/detail.component";

export const routes: Routes = [
  { path: '', component: ContenuComponent },
  { path: '**', component: DetailComponent }
];
