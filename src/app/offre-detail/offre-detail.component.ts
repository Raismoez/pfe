import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";

export interface Offer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  details: {
    objectives: string[];
    description: string;
    pricing: {
      paymentOptions: string[];
    };
    subscription: {
      channels: string[];
    };
  };
}

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
  
  private offers: Offer[] = [
    {
      id: 1,
      title: 'FAST LINK Guichet Unique',
      description: 'Service Internet très haut débit avec une connexion stable et garantie',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
      details: {
        objectives: [
          'Offrir aux clients une connexion très haut débit stable et garantie à des tarifs attractifs',
          'Améliorer l\'expérience client avec un service premium',
          'Contrecarrer les offres de la concurrence avec des avantages exclusifs'
        ],
        description: 'La relance de l\'offre Fast Link consiste à proposer une tarification avantageuse pour les nouveaux clients uniquement pour les accès FO Internet avec des débits supérieurs ou égal à 30M. Notre engagement est de fournir une connexion stable et performante pour répondre à tous vos besoins numériques.',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    },
    {
      id: 2,
      title: 'Rapido PRO',
      description: 'Solution professionnelle haute performance jusqu\'à 100 Mbps',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200',
      details: {
        objectives: [
          'Fournir une connexion professionnelle stable et ultra-rapide',
          'Garantir un support dédié 24/7',
          'Offrir des solutions personnalisées pour chaque entreprise'
        ],
        description: 'Service Internet professionnel haute performance avec garantie de service et support prioritaire. Rapido PRO est conçu pour les entreprises exigeantes qui nécessitent une connexion fiable et rapide pour leurs activités quotidiennes.',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    },
    {
      id: 3,
      title: 'VSAT Enterprise',
      description: 'Connectivité satellite pour les zones reculées',
      imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=1200',
      details: {
        objectives: [
          'Assurer une couverture Internet dans les zones non desservies',
          'Fournir une solution de backup fiable',
          'Garantir une connexion stable peu importe la localisation'
        ],
        description: 'Solution de connectivité par satellite idéale pour les entreprises situées dans des zones non couvertes par la fibre optique. VSAT Enterprise garantit une connexion stable et performante partout en Tunisie.',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    }
  ];

  constructor(private route: ActivatedRoute) {}

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
        this.offer = this.getOfferById(id);
        
        if (!this.offer) {
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
    // Fallback to first offer if available
    if (this.offers.length > 0) {
      this.offer = this.offers[0];
    } else {
      this.error = true;
    }
  }

  private getOfferById(id: number): Offer | undefined {
    return this.offers.find(offer => offer.id === id);
  }
  
  requestInfo() {
    // Implement contact functionality here
    alert('Demande d\'information envoyée. Notre équipe vous contactera prochainement.');
  }
}