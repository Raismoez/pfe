import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-list.component.html',
  styleUrls: ['./offre-list.component.css'],
})
export class OffreListComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchQuery: string = '';
  
  // Modal management
  showOfferModal: boolean = false;
  editMode: boolean = false;
  currentOffer: Offer = {
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    popular: false,
    hasPromo: false,
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

  constructor(
    private offerService: OfferService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOffers();
  }

  // Load all offers
  loadOffers() {
    this.offerService.getOffers().subscribe(offers => {
      this.offers = offers;
      this.filteredOffers = [...this.offers];
      
      // Add animation after data loads
      setTimeout(() => {
        const cards = document.querySelectorAll('.offer-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('visible');
          }, index * 150);
        });
      }, 100);
    });
  }

  // Search function
  onSearch() {
    if (this.searchQuery.trim()) {
      this.filteredOffers = this.offers.filter(offer => 
        offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredOffers = [...this.offers];
    }
  }

  // Open modal to add a new offer
  openAddOfferModal() {
    this.editMode = false;
    this.currentOffer = {
      id: 0,
      title: '',
      description: '',
      imageUrl: '',
      popular: false,
      hasPromo: false,
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
      this.offerService.updateOffer(this.currentOffer);
      this.loadOffers(); // Refresh the list
      this.closeOfferModal();
    } else {
      // For a new offer, we use the addOffer method from your service
      // We need to omit the id as it will be generated
      const { id, ...offerWithoutId } = this.currentOffer;
      this.offerService.addOffer(offerWithoutId);
      this.loadOffers(); // Refresh the list
      this.closeOfferModal();
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
      this.offerService.deleteOffer(this.offerToDelete.id);
      this.loadOffers(); // Refresh the list
      this.cancelDelete();
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