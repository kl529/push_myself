import { supabase } from '../../shared/services/supabase';
import { WeeklyReport } from '../../shared/types/types';

export class WeeklyReportService {
  static async getWeeklyReport(weekStartDate: string): Promise<WeeklyReport | null> {
    if (!supabase) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('week_start_date', weekStartDate)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching weekly report:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getWeeklyReport:', error);
      return null;
    }
  }

  static async saveWeeklyReport(report: WeeklyReport): Promise<WeeklyReport | null> {
    if (!supabase) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .upsert({
          week_start_date: report.week_start_date,
          week_end_date: report.week_end_date,
          what_went_well: report.what_went_well,
          what_didnt_go_well: report.what_didnt_go_well,
          what_learned: report.what_learned,
          next_week_goals: report.next_week_goals,
          weekly_summary: report.weekly_summary,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'week_start_date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving weekly report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveWeeklyReport:', error);
      return null;
    }
  }

  static async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    if (!supabase) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('Error fetching all weekly reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllWeeklyReports:', error);
      return [];
    }
  }

  static async deleteWeeklyReport(weekStartDate: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('weekly_reports')
        .delete()
        .eq('week_start_date', weekStartDate);

      if (error) {
        console.error('Error deleting weekly report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWeeklyReport:', error);
      return false;
    }
  }
}