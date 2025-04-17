// TypeScript - catalogue.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { trigger, transition, style, animate } from '@angular/animations';

export interface Offer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  details: {
    objectives: string[];
    description: string;
  };
}

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class CatalogueComponent implements OnInit, OnDestroy {
  offers: Offer[] = [
    {
      id: 1,
      title: 'FAST LINK Guichet Unique',
      description: 'Service Internet très haut débit avec une connexion stable et garantie',
      imageUrl: 'https://topnet.tn/u_p_l_d/offres/smart-lik_15_0252452001717495224665ee5b83da73.png',
      details: {
        objectives: [
          'Offrir aux clients une connexion très haut débit stable et garantie à des tarifs attractifs',
          'Améliorer l\'expérience client avec un service premium',
          'Contrecarrer les offres de la concurrence avec des avantages exclusifs'
        ],
        description: 'La relance de l\'offre Fast Link consiste à proposer une tarification avantageuse pour les nouveaux clients uniquement pour les accès FO Internet avec des débits supérieurs ou égal à 30M. Notre engagement est de fournir une connexion stable et performante pour répondre à tous vos besoins numériques.'
      }
    },
    {
      id: 2,
      title: 'Rapido PRO',
      description: 'Solution professionnelle haute performance jusqu\'à 100 Mbps',
      imageUrl: 'https://www.topnet.tn/u_p_l_d/offres/smart-rapido-pro_86_0710448001699976624655395b0ad77b.png',
      details: {
        objectives: [
          'Fournir une connexion professionnelle stable et ultra-rapide',
          'Garantir un support dédié 24/7',
          'Offrir des solutions personnalisées pour chaque entreprise'
        ],
        description: 'Service Internet professionnel haute performance avec garantie de service et support prioritaire. Rapido PRO est conçu pour les entreprises exigeantes qui nécessitent une connexion fiable et rapide pour leurs activités quotidiennes.'
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
        description: 'Solution de connectivité par satellite idéale pour les entreprises situées dans des zones non couvertes par la fibre optique. VSAT Enterprise garantit une connexion stable et performante partout en Tunisie.'
      }
    }
  ];
  
  currentIndex = 0;
  private intervalId?: number;
  private readonly slideDuration = 5000; // 5 secondes par slide
  isPaused = false;
  touchStartX = 0;
  touchEndX = 0;

  constructor() {}

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  // Méthodes pour le carrousel
  startSlideshow() {
    if (!this.isPaused) {
      this.stopSlideshow(); // S'assurer qu'il n'y a pas d'intervalle actif
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
      ? this.offers.length - 1
      : this.currentIndex - 1;
  }

  nextSlide() {
    this.resetSlideTimer();
    this.currentIndex = (this.currentIndex + 1) % this.offers.length;
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
    // Si l'index est immédiatement avant le courant, ou c'est le dernier slide et le courant est 0
    return (index === this.currentIndex - 1) || 
           (this.currentIndex === 0 && index === this.offers.length - 1);
  }

  isNext(index: number): boolean {
    // Si l'index est immédiatement après le courant, ou c'est 0 et le courant est le dernier
    return (index === this.currentIndex + 1) || 
           (this.currentIndex === this.offers.length - 1 && index === 0);
  }

 

  private handleSwipe() {
    const threshold = 50; // Seuil minimum pour considérer comme un swipe
    const difference = this.touchEndX - this.touchStartX;
    
    if (Math.abs(difference) >= threshold) {
      if (difference > 0) {
        // Swipe vers la droite -> slide précédente
        this.previousSlide();
      } else {
        // Swipe vers la gauche -> slide suivante
        this.nextSlide();
      }
    }
  }

  
}