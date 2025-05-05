import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { ReservationComponent } from '../reservation/reservation.component';
import { Offer, OfferService } from "../services/offre.service";
import { Subscription } from 'rxjs';

// Define category interface
interface OfferCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, SidebarComponent, HeaderComponent, ReservationComponent],
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css'],
})
export class CatalogueComponent implements OnInit, OnDestroy {
  // All offers
  offers: Offer[] = [];
  
  // Specific popular offers for display
  popularOffers: Offer[] = [];
  specificPopularOffers: Offer[] = [];
  
  // Main categories for carousel
  offerCategories: OfferCategory[] = [
    {
      id: 'corporate-vpn',
      title: 'Offres Corporate VPN',
      description: 'Solutions de réseaux privés virtuels pour les entreprises avec différentes options de connectivité.',
      imageUrl: 'corporate.vpn.png'
    },
    {
      id: 'sd-wan',
      title: 'Offres SD-WAN',
      description: 'Solutions Software-Defined Wide Area Network pour une gestion réseau simplifiée et optimisée.',
      imageUrl: 'sd-wan.png'
    }
  ];
  
  currentIndex = 0;
  private intervalId?: number;
  private readonly slideDuration = 7000; // 7 secondes par slide
  isPaused = false;
  touchStartX = 0;
  touchEndX = 0;
  public user: any;
  public isAdmin: boolean = false;
  public isCommercialAgent: boolean = false;
  public isTechnicalAgent: boolean = false;
  
  // Role constants from login component
  private readonly ROLE_ADMIN = 1;
  private readonly ROLE_AGENT_COMMERCIAL = 2;
  private readonly ROLE_AGENT_TECHNIQUE = 3;

  private offersSubscription?: Subscription;

  constructor(private offerService: OfferService) {}

  ngOnInit() {
    this.loadOffers();
    this.startSlideshow();
    this.user = JSON.parse(sessionStorage.getItem("user") || '{}');
    
    // Get role from localStorage (as a fallback if user object doesn't have role)
    const roleId = this.user.idRole || parseInt(localStorage.getItem('idRole') || '0');
    
    // Set role flags
    this.isAdmin = roleId === this.ROLE_ADMIN;
    this.isCommercialAgent = roleId === this.ROLE_AGENT_COMMERCIAL;
    this.isTechnicalAgent = roleId === this.ROLE_AGENT_TECHNIQUE;
  }

  ngOnDestroy() {
    this.stopSlideshow();
    if (this.offersSubscription) {
      this.offersSubscription.unsubscribe();
    }
  }

  loadOffers() {
    this.offersSubscription = this.offerService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        
        // Filter popular offers
        this.popularOffers = offers.filter(offer => offer.popular);
        
        // Filter for ONLY the three specific offers you want
        this.specificPopularOffers = offers.filter(offer => 
          offer.title === 'Corporate VPN FO' || 
          offer.title === 'Corporate VPN FO Backup FO' || 
          offer.title === 'SD-WAN FO'
        );
        
        // Fallback if the specific offers aren't found
        if (this.specificPopularOffers.length === 0) {
          console.warn('Specific offers not found, showing alternatives');
          this.specificPopularOffers = this.popularOffers.slice(0, 3);
        }
        
        // Start the slideshow after offers are loaded
        if (this.offerCategories.length > 0) {
          this.startSlideshow();
        }
      },
      error: (error) => {
        console.error('Error loading offers:', error);
      }
    });
  }
  // Carousel methods
  startSlideshow() {
    if (!this.isPaused && this.offerCategories.length > 0) {
      this.stopSlideshow(); // Ensure no active interval
      this.intervalId = window.setInterval(() => {
        this.nextSlide();
      }, this.slideDuration);
    }
  }

  stopSlideshow() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  previousSlide() {
    this.resetSlideTimer();
    this.currentIndex = this.currentIndex === 0
      ? this.offerCategories.length - 1
      : this.currentIndex - 1;
  }

  nextSlide() {
    this.resetSlideTimer();
    this.currentIndex = (this.currentIndex + 1) % this.offerCategories.length;
  }

  goToSlide(index: number) {
    if (index !== this.currentIndex) {
      this.resetSlideTimer();
      this.currentIndex = index;
    }
  }

  resetSlideTimer() {
    this.stopSlideshow();
    if (!this.isPaused) {
      this.startSlideshow();
    }
  }

  isPrevious(index: number): boolean {
    return (index === this.currentIndex - 1) || 
           (this.currentIndex === 0 && index === this.offerCategories.length - 1);
  }

  isNext(index: number): boolean {
    return (index === this.currentIndex + 1) || 
           (this.currentIndex === this.offerCategories.length - 1 && index === 0);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const threshold = 50; // Minimum threshold for swipe detection
    const difference = this.touchEndX - this.touchStartX;
    
    if (Math.abs(difference) >= threshold) {
      if (difference > 0) {
        // Swipe right -> previous slide
        this.previousSlide();
      } else {
        // Swipe left -> next slide
        this.nextSlide();
      }
    }
  }
}