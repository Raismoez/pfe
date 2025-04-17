import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { Offer, OfferService } from "../services/offre.service";

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    SidebarComponent, 
    HeaderComponent,
  ],
  templateUrl: './offre-form.component.html',
  styleUrls: ['./offre-form.component.css']
})
export class OffreFormComponent implements OnInit {
  offerForm!: FormGroup;
  isEditMode = false;
  offerId: number | null = null;
  pageTitle = 'Ajouter une nouvelle offre';
  submitButtonText = 'Créer';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.offerId = +id;
        this.pageTitle = 'Modifier l\'offre';
        this.submitButtonText = 'Mettre à jour';
        this.loadOfferData(+id);
      }
    });
  }

  initForm(): void {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', Validators.required],
      popular: [false],
      hasPromo: [false],
      details: this.fb.group({
        objectives: this.fb.array([this.createObjective()]),
        description: ['', Validators.required],
        features: this.fb.array([this.createFeature()]),
        price: [''],
        pricing: this.fb.group({
          paymentOptions: this.fb.array([this.createPaymentOption()])
        }),
        subscription: this.fb.group({
          channels: this.fb.array([this.createChannel()])
        })
      })
    });
  }

  loadOfferData(id: number): void {
    const offer = this.offerService.getOfferById(id);
    
    if (!offer) {
      this.router.navigate(['/offrelist']);
      return;
    }
    
    // Clear existing form arrays
    this.objectivesArray.clear();
    this.featuresArray.clear();
    this.paymentOptionsArray.clear();
    this.channelsArray.clear();
    
    // Add objectives
    if (offer.details.objectives) {
      offer.details.objectives.forEach(objective => {
        this.objectivesArray.push(this.fb.control(objective));
      });
    }
    
    // Add features
    if (offer.details.features) {
      offer.details.features.forEach(feature => {
        this.featuresArray.push(this.fb.control(feature));
      });
    }
    
    // Add payment options
    if (offer.details.pricing?.paymentOptions) {
      offer.details.pricing.paymentOptions.forEach(option => {
        this.paymentOptionsArray.push(this.fb.control(option));
      });
    }
    
    // Add channels
    if (offer.details.subscription?.channels) {
      offer.details.subscription.channels.forEach(channel => {
        this.channelsArray.push(this.fb.control(channel));
      });
    }
    
    // Update form with offer data
    this.offerForm.patchValue({
      title: offer.title,
      description: offer.description,
      imageUrl: offer.imageUrl,
      popular: offer.popular || false,
      hasPromo: offer.hasPromo || false,
      details: {
        description: offer.details.description,
        price: offer.details.price || ''
      }
    });
  }

  get objectivesArray(): FormArray {
    return this.offerForm.get('details.objectives') as FormArray;
  }

  get featuresArray(): FormArray {
    return this.offerForm.get('details.features') as FormArray;
  }

  get paymentOptionsArray(): FormArray {
    return this.offerForm.get('details.pricing.paymentOptions') as FormArray;
  }

  get channelsArray(): FormArray {
    return this.offerForm.get('details.subscription.channels') as FormArray;
  }
  
  createObjective(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }
  
  createFeature(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }
  
  createPaymentOption(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }
  
  createChannel(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }
  
  addObjective(): void {
    this.objectivesArray.push(this.fb.control(''));
  }
  
  removeObjective(index: number): void {
    this.objectivesArray.removeAt(index);
  }
  
  addFeature(): void {
    this.featuresArray.push(this.fb.control(''));
  }
  
  removeFeature(index: number): void {
    this.featuresArray.removeAt(index);
  }
  
  addPaymentOption(): void {
    this.paymentOptionsArray.push(this.fb.control(''));
  }
  
  removePaymentOption(index: number): void {
    this.paymentOptionsArray.removeAt(index);
  }
  
  addChannel(): void {
    this.channelsArray.push(this.fb.control(''));
  }
  
  removeChannel(index: number): void {
    this.channelsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.offerForm);
      return;
    }
    
    this.isLoading = true;
    
    // Transform form data to match Offer interface
    const formData = this.offerForm.value;
    
    const offer: Omit<Offer, 'id'> = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      popular: formData.popular,
      hasPromo: formData.hasPromo,
      details: {
        objectives: this.objectivesArray.value.map((item: any) => item.value || item),
        description: formData.details.description,
        features: this.featuresArray.value.map((item: any) => item.value || item),
        price: formData.details.price,
        pricing: {
          paymentOptions: this.paymentOptionsArray.value.map((item: any) => item.value || item)
        },
        subscription: {
          channels: this.channelsArray.value.map((item: any) => item.value || item)
        }
      }
    };
    
    // Save or update based on mode
    if (this.isEditMode && this.offerId) {
      this.offerService.updateOffer({ ...offer, id: this.offerId });
    } else {
      this.offerService.addOffer(offer);
    }
    
    // Navigate back to list after brief delay
    setTimeout(() => {
      this.router.navigate(['/offrelist']);
    }, 500);
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      
      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/offrelist']);
  }
}