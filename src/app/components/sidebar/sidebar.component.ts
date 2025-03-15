import { Component } from '@angular/core';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone:true,
   imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    private router : Router,
  ){}
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('identifiant');
    this.router.navigate(['/']);
  }
}
