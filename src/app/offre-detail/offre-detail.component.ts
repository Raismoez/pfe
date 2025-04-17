import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-detail.component.html',
  styleUrls: ['./offre-detail.component.css']
})
export class OffreDetailComponent implements OnInit {
  offer?: Offer;
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService
  ) {}

  ngOnInit() {
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.loadOfferData();
      this.loading = false;
    }, 500);
  }

  private loadOfferData() {
    try {
      // Get ID from route parameters
      const idParam = this.route.snapshot.paramMap.get('id');
      
      if (idParam) {
        const id = Number(idParam);
        const foundOffer = this.offerService.getOfferById(id);
        
        if (foundOffer) {
          this.offer = foundOffer;
        } else {
          console.warn(`Offer with ID ${id} not found`);
          this.handleMissingOffer();
        }
      } else {
        console.error('No ID parameter found in route');
        this.handleMissingOffer();
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
      this.error = true;
    }
  }

  private handleMissingOffer() {
    // Fallback to first offer
    const offers = this.offerService.getOffers();
    offers.subscribe(allOffers => {
      if (allOffers.length > 0) {
        this.offer = allOffers[0];
      } else {
        this.error = true;
      }
    });
  }
  
 
}