import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { Chat } from './Components/chat/chat';
import { Join } from './Components/join/join';
import { Host } from './Components/host/host';
import { EnterName } from './Components/enter-name/enter-name';
import { UpComing } from './Utilities/up-coming/up-coming';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'chat/:roomId', component: Chat },
  { path: 'join', component: Join },
  { path: 'host', component: Host },
  { path: 'enter-name', component: EnterName },
  { path: 'update', component: UpComing }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
