import type {
  ExpiryEstimation,
  ExpiryEstimatorService,
} from '@domain/product/services/expiry-estimator';
import type { ProductLocation, ProductStatus } from '@domain/product/value-objects';

/**
 * Rule-based expiry estimator for offline/development use.
 *
 * Provides conservative estimates based on common food safety guidelines.
 * Used as fallback when OpenAI API is unavailable or in development mode.
 *
 * Estimation logic:
 * - Perishables (dairy, meat, fish): 2-5 days in fridge, shorter when opened
 * - Fresh produce: 3-7 days
 * - Dry goods: 180-365 days in pantry
 * - Freezer extends all shelf lives significantly
 * - "Opened" status reduces shelf life by ~50%
 */
export class ExpiryEstimatorStub implements ExpiryEstimatorService {
  async estimateExpiryDate(
    productName: string,
    status: ProductStatus,
    location?: ProductLocation
  ): Promise<ExpiryEstimation> {
    const nameLower = productName.toLowerCase();

    // Freezer significantly extends shelf life
    if (location === 'freezer') {
      return this.estimateFrozen(status);
    }

    // Identify product category
    if (this.isPerishableDairy(nameLower)) {
      return this.estimatePerishableDairy(status, location);
    }

    if (this.isPerishableMeat(nameLower)) {
      return this.estimatePerishableMeat(status, location);
    }

    if (this.isFreshProduce(nameLower)) {
      return this.estimateFreshProduce(status, location);
    }

    if (this.isDryGood(nameLower)) {
      return this.estimateDryGood(status);
    }

    // Unknown product - conservative estimate
    return this.estimateUnknown(status, location);
  }

  private isPerishableDairy(name: string): boolean {
    return (
      name.includes('milk') ||
      name.includes('leche') ||
      name.includes('yogur') ||
      name.includes('yogurt') ||
      name.includes('queso') ||
      name.includes('cheese') ||
      name.includes('nata') ||
      name.includes('cream')
    );
  }

  private isPerishableMeat(name: string): boolean {
    return (
      name.includes('pollo') ||
      name.includes('chicken') ||
      name.includes('carne') ||
      name.includes('meat') ||
      name.includes('pescado') ||
      name.includes('fish') ||
      name.includes('salmon') ||
      name.includes('cerdo') ||
      name.includes('pork') ||
      name.includes('ternera') ||
      name.includes('beef')
    );
  }

  private isFreshProduce(name: string): boolean {
    return (
      name.includes('tomat') ||
      name.includes('lettuce') ||
      name.includes('lechuga') ||
      name.includes('zanahoria') ||
      name.includes('carrot') ||
      name.includes('apple') ||
      name.includes('manzana') ||
      name.includes('banana') ||
      name.includes('plátano') ||
      name.includes('pepper') ||
      name.includes('pimiento')
    );
  }

  private isDryGood(name: string): boolean {
    return (
      name.includes('rice') ||
      name.includes('arroz') ||
      name.includes('pasta') ||
      name.includes('flour') ||
      name.includes('harina') ||
      name.includes('bean') ||
      name.includes('alubia') ||
      name.includes('lentil') ||
      name.includes('lenteja') ||
      name.includes('cereal')
    );
  }

  private estimatePerishableDairy(
    status: ProductStatus,
    location?: ProductLocation
  ): ExpiryEstimation {
    if (location !== 'fridge') {
      // Dairy outside fridge expires very quickly
      return { date: this.addDays(1), confidence: 'high' };
    }

    const baseDays = status === 'new' ? 7 : 3; // Opened dairy lasts ~3 days
    return { date: this.addDays(baseDays), confidence: 'high' };
  }

  private estimatePerishableMeat(
    status: ProductStatus,
    location?: ProductLocation
  ): ExpiryEstimation {
    if (location !== 'fridge') {
      // Meat outside fridge expires same day
      return { date: this.addDays(0), confidence: 'high' };
    }

    const baseDays = status === 'new' ? 3 : 1; // Opened meat lasts ~1 day
    return { date: this.addDays(baseDays), confidence: 'high' };
  }

  private estimateFreshProduce(
    status: ProductStatus,
    location?: ProductLocation
  ): ExpiryEstimation {
    // Produce is typically stored in fridge or pantry
    const inFridge = location === 'fridge';
    const baseDays = inFridge ? 7 : 5;
    const days = status === 'new' ? baseDays : Math.floor(baseDays / 2);
    return { date: this.addDays(days), confidence: 'medium' };
  }

  private estimateDryGood(status: ProductStatus): ExpiryEstimation {
    // Dry goods last a long time
    const baseDays = status === 'new' ? 365 : 180; // Opened dry goods still last months
    return { date: this.addDays(baseDays), confidence: 'medium' };
  }

  private estimateFrozen(status: ProductStatus): ExpiryEstimation {
    // Freezer extends shelf life significantly
    const baseDays = status === 'new' ? 180 : 90; // ~6 months new, ~3 months opened
    return { date: this.addDays(baseDays), confidence: 'medium' };
  }

  private estimateUnknown(status: ProductStatus, location?: ProductLocation): ExpiryEstimation {
    // Conservative estimate for unknown products
    if (location === 'fridge') {
      return { date: this.addDays(5), confidence: 'low' };
    }
    if (location === 'pantry') {
      return { date: this.addDays(30), confidence: 'low' };
    }
    // No location info - very conservative
    return { date: this.addDays(3), confidence: 'low' };
  }

  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
