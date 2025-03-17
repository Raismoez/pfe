import { Component, Input } from '@angular/core';
import { RouterModule} from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  public user = JSON.parse(sessionStorage.getItem("user") || '{}');
}
