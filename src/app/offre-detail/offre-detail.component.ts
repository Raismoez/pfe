import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-detail.component.html',
  styleUrls: ['./offre-detail.component.css']
})
export class OffreDetailComponent implements OnInit, OnDestroy {
  offer?: Offer;
  loading: boolean = true;
  error: boolean = false;
  category?: string;
  private subscriptions: Subscription[] = [];
  
  // Variables pour la gestion du modal de solutions
  showSolutionModal: boolean = false;
  currentSolutionType: string = ''; // 'cisco', 'huawei', ou 'fortinet'
  currentSolutionContent: string = '';
  user: any;
  public isAdmin: boolean = false;
  public isCommercialAgent: boolean = false;
  public isTechnicalAgent: boolean = false;
  
  // Role constants from login component
  private readonly ROLE_ADMIN = 1;
  private readonly ROLE_AGENT_COMMERCIAL = 2;
  private readonly ROLE_AGENT_TECHNIQUE = 3;
 
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
    this.user = JSON.parse(sessionStorage.getItem("user") || '{}');
    const roleId = this.user.idRole || parseInt(localStorage.getItem('idRole') || '0');
    
    // Set role flags
    this.isAdmin = roleId === this.ROLE_ADMIN;
    this.isCommercialAgent = roleId === this.ROLE_AGENT_COMMERCIAL;
    this.isTechnicalAgent = roleId === this.ROLE_AGENT_TECHNIQUE;
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
  
  // Méthode pour formatter les solutions en liste
  formatSolution(solution: string): string[] {
    if (!solution) return [];
    
    // Simplement diviser par les sauts de ligne
    const lines = solution.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return [solution.trim()];
    }
    
    return lines;
  }
  
  // Méthode pour naviguer en arrière avec préservation de la catégorie
  goBack() {
    this.router.navigate(['/offrelist'], { 
      queryParams: { category: this.category }
    });
  }
  
  // Nouvelle méthode pour ouvrir le modal d'édition de solution
  editSolution(type: string) {
    this.currentSolutionType = type;
    
    // Récupérer le contenu actuel de la solution
    let content = '';
    if (type === 'cisco' && this.offer?.details.solutionCisco) {
      content = this.offer.details.solutionCisco;
    } else if (type === 'huawei' && this.offer?.details.solutionHuawei) {
      content = this.offer.details.solutionHuawei;
    } else if (type === 'fortinet' && this.offer?.details.solutionFortinet) {
      content = this.offer.details.solutionFortinet;
    }
    
    this.currentSolutionContent = content;
    this.showSolutionModal = true;
  }

  // Méthode pour fermer le modal d'édition de solution
  closeSolutionModal() {
    this.showSolutionModal = false;
  }

  // Méthode pour soumettre le formulaire d'édition de solution
  onSubmitSolutionForm() {
    if (!this.offer) return;
    
    // Mettre à jour la solution correspondante
    if (this.currentSolutionType === 'cisco') {
      this.offer.details.solutionCisco = this.currentSolutionContent;
    } else if (this.currentSolutionType === 'huawei') {
      this.offer.details.solutionHuawei = this.currentSolutionContent;
    } else if (this.currentSolutionType === 'fortinet') {
      this.offer.details.solutionFortinet = this.currentSolutionContent;
    }
    
    // Appeler le service pour mettre à jour l'offre
    const offerId = this.offer.id;
    
    this.offerService.updateOffer(offerId, this.offer).subscribe({
      next: (updatedOffer) => {
        console.log('Solution mise à jour avec succès:', updatedOffer);
        this.offer = updatedOffer;
        this.closeSolutionModal();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la solution:', error);
        // Vous pouvez ajouter ici un message d'erreur pour l'utilisateur
      }
    });
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}