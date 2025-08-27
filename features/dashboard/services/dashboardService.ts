// Dashboard service - handles dashboard-specific data operations
export class DashboardService {
  // Self-affirmation localStorage operations
  static saveAffirmation(affirmation: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userAffirmation', affirmation);
    }
  }

  static getAffirmation(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAffirmation') || '';
    }
    return '';
  }

  static clearAffirmation(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userAffirmation');
    }
  }
}