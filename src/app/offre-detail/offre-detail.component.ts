import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-detail.component.html',
  styleUrls: ['./offre-detail.component.css']
})
export class OffreDetailComponent implements OnInit, OnDestroy {
  offer?: Offer;
  loading: boolean = true;
  error: boolean = false;
  category?: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService
  ) {}

  ngOnInit() {
    // Récupérer la catégorie depuis les paramètres de requête
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
    });

    // Reste du code d'initialisation inchangé
    setTimeout(() => {
      this.loadOfferData();
    }, 500);
  }

  private loadOfferData() {
    try {
      const idParam = this.route.snapshot.paramMap.get('id');
      
      if (idParam) {
        const id = Number(idParam);
        
        const sub = this.offerService.getOfferById(id).subscribe({
          next: (offer) => {
            console.log('Received offer data:', offer);
            this.offer = offer;
            this.loading = false;
            
            // Si la catégorie n'est pas définie, essayer de la déduire de l'offre
            if (!this.category) {
              if (offer.title.toLowerCase().includes('vpn') || 
                  offer.description.toLowerCase().includes('vpn')) {
                this.category = 'corporate-vpn';
              } else if (offer.title.toLowerCase().includes('sd-wan') || 
                        offer.description.toLowerCase().includes('sd-wan')) {
                this.category = 'sd-wan';
              }
              console.log('Deduced category:', this.category);
            }
          },
          error: (error) => {
            console.error(`Error fetching offer with ID ${id}:`, error);
            this.handleMissingOffer();
          }
        });
        
        this.subscriptions.push(sub);
      } else {
        console.error('No ID parameter found in route');
        this.handleMissingOffer();
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
      this.error = true;
      this.loading = false;
    }
  }

  private handleMissingOffer() {
    const sub = this.offerService.getOffers().subscribe({
      next: (allOffers) => {
        if (allOffers.length > 0) {
          this.offer = allOffers[0];
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching all offers:', error);
        this.error = true;
        this.loading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Méthode pour naviguer en arrière avec préservation de la catégorie
  goBack() {
    this.router.navigate(['/offrelist'], { 
      queryParams: { category: this.category } 
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
  
