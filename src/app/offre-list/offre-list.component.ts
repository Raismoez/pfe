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
  categoryTitle: string = '';
  
  // Modal management
  showOfferModal: boolean = false;
  editMode: boolean = false;
  currentOffer: Offer = {
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    offreType: '', // S'assurer que offreType est initialisé ici
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
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  notificationTimeout: any = null;
  
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
    if (this.notificationTimeout) {
    clearTimeout(this.notificationTimeout);
  }
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  showNotificationMessage(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 3000) {
  // Annuler tout timeout existant
  if (this.notificationTimeout) {
    clearTimeout(this.notificationTimeout);
  }
  
  // Définir le message et afficher la notification
  this.notificationMessage = message;
  this.notificationType = type;
  this.showNotification = true;
  
  // Masquer automatiquement après la durée spécifiée
  this.notificationTimeout = setTimeout(() => {
    this.showNotification = false;
  }, duration);
}

// Méthode d'aide pour extraire des messages d'erreur
private getErrorMessage(error: any): string {
  return error.error?.message || error.message || "Une erreur s'est produite";
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
        
        console.log('Offers loaded:', this.offers);
        console.log('Filtered offers:', this.filteredOffers);
        
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

  // Correction de la méthode filterOffersByCategory
  filterOffersByCategory(offers: Offer[], category: string): Offer[] {
    console.log('Filtering by category:', category);
    console.log('Before filtering:', offers);
    
    const filteredOffers = offers.filter(offer => {
      // Vérifier si offreType correspond à la catégorie
      if (offer.offreType === category) {
        return true;
      }
      
      // Fallback pour la compatibilité avec les anciennes données
      if (!offer.offreType) {
        if (category === 'corporate-vpn' && offer.title.toLowerCase().includes('corporate vpn')) {
          return true;
        } else if (category === 'sd-wan' && offer.title.toLowerCase().includes('sd-wan')) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log('After filtering:', filteredOffers);
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
      },
      solutionCisco: '',
      solutionHuawei: '',
      solutionFortinet: ''
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
    if (!this.currentOffer.details.solutionCisco) {
      this.currentOffer.details.solutionCisco = '';
    }
    if (!this.currentOffer.details.solutionHuawei) {
      this.currentOffer.details.solutionHuawei = '';
    }
    if (!this.currentOffer.details.solutionFortinet) {
      this.currentOffer.details.solutionFortinet = '';
    }

    if (this.objectivesInput) {
      this.currentOffer.details.objectives = this.objectivesInput
        .split(';')
        .map(objective => objective.trim())
        .filter(objective => objective.length > 0);
    } else {
      this.currentOffer.details.objectives = [];
    }

    // S'assurer que offreType est correctement traité
    console.log('Offer before submit:', this.currentOffer);

    if (this.editMode) {
      const sub = this.offerService.updateOffer(this.currentOffer.id, this.currentOffer).subscribe({
        next: () => {
          
          this.loadOffers(); // Refresh the list
          this.showNotificationMessage(`L’offre "${this.currentOffer.title}" a été mise à jour avec succès.`, 'success');
          this.closeOfferModal();
        },
        error: error => {
          
          this.showNotificationMessage(this.getErrorMessage(error), 'error');

        }
      });
      this.subscriptions.push(sub);
    } else {
      // For a new offer, we use the addOffer method from your service
      // We need to omit the id as it will be generated
      const { id, ...offerWithoutId } = this.currentOffer;
      
      
      
      const sub = this.offerService.addOffer(offerWithoutId).subscribe({
        next: (newOffer) => {
          console.log('Offer added successfully:', newOffer);
          this.loadOffers(); // Refresh the list
           this.showNotificationMessage(`L’offre "${newOffer.title}" a été ajoutée avec succès.`, 'success');
          this.closeOfferModal();
        },
        error: error => {
          console.error('Error adding offer:', error);
          this.showNotificationMessage(this.getErrorMessage(error), 'error');

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
          this.showNotificationMessage(`L’offre "${this.offerToDelete?.title}" a été supprimée avec succès.`, 'success');
          this.cancelDelete();
        },
        error: error => {
          console.error('Error deleting offer:', error);
          this.showNotificationMessage(this.getErrorMessage(error), 'error');
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
