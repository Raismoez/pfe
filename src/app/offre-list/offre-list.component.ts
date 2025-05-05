import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-list.component.html',
  styleUrls: ['./offre-list.component.css'],
})
export class OffreListComponent implements OnInit, OnDestroy {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchQuery: string = '';
  categoryFilter: string = '';
  categoryTitle: string = 'Toutes les offres';
  
  // Modal management
  showOfferModal: boolean = false;
  editMode: boolean = false;
  currentOffer: Offer = {
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    popular: false,
    details: {
      objectives: [],
      description: '',
      features: [],
      price: '',
      pricing: {
        paymentOptions: ['Paiement échelonné sur 12 mois ou 24 mois ou 36 mois', 'Paiement au comptant']
      },
      subscription: {
        channels: ['La Direction Marché Entreprises', 'Les Espaces Entreprises', 'Réseaux de distribution indirecte']
      }
    }
  };
  
  // Input fields for arrays
  featuresInput: string = '';
  objectivesInput: string = '';
  
  // Delete confirmation
  showDeleteConfirmation: boolean = false;
  offerToDelete: Offer | null = null;
  user: any;
  public isAdmin: boolean = false;
  public isCommercialAgent: boolean = false;
  public isTechnicalAgent: boolean = false;
  
  // Role constants from login component
  private readonly ROLE_ADMIN = 1;
  private readonly ROLE_AGENT_COMMERCIAL = 2;
  private readonly ROLE_AGENT_TECHNIQUE = 3;
  private subscriptions: Subscription[] = [];
  
  

  constructor(
    private offerService: OfferService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  ngOnInit() {
    // Subscribe to route query params to get the category filter
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.categoryFilter = params['category'] || '';
        
        // Set category title
        if (this.categoryFilter === 'corporate-vpn') {
          this.categoryTitle = 'Offres Corporate VPN';
        } else if (this.categoryFilter === 'sd-wan') {
          this.categoryTitle = 'Offres SD-WAN';
        } else {
          this.categoryTitle = 'Toutes les offres';
        }
        
        this.loadOffers();
      })
    );
    this.user = JSON.parse(sessionStorage.getItem("user") || '{}');
    const roleId = this.user.idRole || parseInt(localStorage.getItem('idRole') || '0');
    
    // Set role flags
    this.isAdmin = roleId === this.ROLE_ADMIN;
    this.isCommercialAgent = roleId === this.ROLE_AGENT_COMMERCIAL;
    this.isTechnicalAgent = roleId === this.ROLE_AGENT_TECHNIQUE;
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load all offers and filter by category if needed
  loadOffers() {
    const sub = this.offerService.getOffers().subscribe({
      next: offers => {
        this.offers = offers;
        
        // Filter offers by category if a category is selected
        if (this.categoryFilter) {
          this.filteredOffers = this.filterOffersByCategory(offers, this.categoryFilter);
        } else {
          this.filteredOffers = [...this.offers];
        }
        
        // Add animation after data loads
        setTimeout(() => {
          const cards = document.querySelectorAll('.offer-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, index * 150);
          });
        }, 100);
      },
      error: error => {
        console.error('Error loading offers:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

// Correction pour la méthode filterOffersByCategory
filterOffersByCategory(offers: Offer[], category: string): Offer[] {

  // Vérification de la présence du champ offreType
  const filteredOffers = offers.filter(offer => {

    if (!offer.offreType && category === 'corporate-vpn') {
      // Si le titre contient "Corporate VPN", considérer comme appartenant à la catégorie
      return offer.title.includes('Corporate VPN');
    } else if (!offer.offreType && category === 'sd-wan') {
      // Si le titre contient "SD-WAN", considérer comme appartenant à la catégorie
      return offer.title.includes('SD-WAN');
    }
    
    return offer.offreType === category;
  });
  
  console.log('Filtered offers:', filteredOffers);
  return filteredOffers;
}

  // Search function
  onSearch() {
    if (this.searchQuery.trim()) {
      // First filter by category if needed
      let baseOffers = this.categoryFilter ? 
        this.filterOffersByCategory(this.offers, this.categoryFilter) : 
        this.offers;
      
      // Then apply search filter
      this.filteredOffers = baseOffers.filter(offer => 
        offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If search is cleared, just apply category filter if needed
      if (this.categoryFilter) {
        this.filteredOffers = this.filterOffersByCategory(this.offers, this.categoryFilter);
      } else {
        this.filteredOffers = [...this.offers];
      }
    }
  }

  // Clear category filter
  clearCategoryFilter() {
    this.router.navigate(['/offrelist'], { queryParams: {} });
  }

 // Open modal to add a new offer
openAddOfferModal() {
  this.editMode = false;
  this.currentOffer = {
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    offreType: '', 
    popular: false,
    details: {
      objectives: [],
      description: '',
      features: [],
      price: '',
      pricing: {
        paymentOptions: ['Paiement échelonné sur 12 mois ou 24 mois ou 36 mois', 'Paiement au comptant']
      },
      subscription: {
        channels: ['La Direction Marché Entreprises', 'Les Espaces Entreprises', 'Réseaux de distribution indirecte']
      }
    }
  };
  this.featuresInput = '';
  this.objectivesInput = '';
  this.showOfferModal = true;
}

  // Open modal to edit an existing offer
  editOffer(offer: Offer, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.editMode = true;
    this.currentOffer = JSON.parse(JSON.stringify(offer)); // Deep copy
    this.featuresInput = this.currentOffer.details.features.join('; ');
    this.objectivesInput = this.currentOffer.details.objectives.join('; ');
    this.showOfferModal = true;
  }

  // Close the offer modal
  closeOfferModal() {
    this.showOfferModal = false;
  }

  // Submit the offer form
  onSubmitOfferForm() {
    // Process features and objectives from input string
    if (this.featuresInput) {
      this.currentOffer.details.features = this.featuresInput
        .split(';')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
    } else {
      this.currentOffer.details.features = [];
    }

    if (this.objectivesInput) {
      this.currentOffer.details.objectives = this.objectivesInput
        .split(';')
        .map(objective => objective.trim())
        .filter(objective => objective.length > 0);
    } else {
      this.currentOffer.details.objectives = [];
    }

    if (this.editMode) {
      const sub = this.offerService.updateOffer(this.currentOffer).subscribe({
        next: () => {
          this.loadOffers(); // Refresh the list
          this.closeOfferModal();
        },
        error: error => {
          console.error('Error updating offer:', error);
          alert('Failed to update offer. Please try again.');
        }
      });
      this.subscriptions.push(sub);
    } else {
      // For a new offer, we use the addOffer method from your service
      // We need to omit the id as it will be generated
      const { id, ...offerWithoutId } = this.currentOffer;
      const sub = this.offerService.addOffer(offerWithoutId).subscribe({
        next: () => {
          this.loadOffers(); // Refresh the list
          this.closeOfferModal();
        },
        error: error => {
          console.error('Error adding offer:', error);
          alert('Failed to add offer. Please try again.');
        }
      });
      this.subscriptions.push(sub);
    }
  }

  // Open delete confirmation modal
  confirmDelete(offer: Offer, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.offerToDelete = offer;
    this.showDeleteConfirmation = true;
  }

  // Delete offer after confirmation
  deleteOfferConfirmed() {
    if (this.offerToDelete) {
      const sub = this.offerService.deleteOffer(this.offerToDelete.id).subscribe({
        next: () => {
          this.loadOffers(); // Refresh the list
          this.cancelDelete();
        },
        error: error => {
          console.error('Error deleting offer:', error);
          alert('Failed to delete offer. Please try again.');
          this.cancelDelete();
        }
      });
      this.subscriptions.push(sub);
    }
  }

  // Cancel delete operation
  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.offerToDelete = null;
  }

  // View offer details
  viewOfferDetails(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/offer', id]);
  }
}