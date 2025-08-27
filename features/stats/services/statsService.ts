import { supabase } from '../../shared/services/supabase';
import { WeeklyStats, DayData } from '../../shared/types/types';

export class StatsService {
  static async getWeeklyStats(weekStartDate: string): Promise<WeeklyStats | null> {
    if (!supabase) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .select('*')
        .eq('week_start_date', weekStartDate)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching weekly stats:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getWeeklyStats:', error);
      return null;
    }
  }

  static async getAllWeeklyStats(): Promise<WeeklyStats[]> {
    if (!supabase) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('Error fetching all weekly stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllWeeklyStats:', error);
      return [];
    }
  }

  static async calculateAndSaveWeeklyStats(
    weekStartDate: string, 
    weekData: { [date: string]: DayData }
  ): Promise<WeeklyStats | null> {
    try {
      const weekStart = new Date(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Calculate stats from the week's data
      let dailyReportsWritten = 0;
      let completedTasks = 0;
      let totalMood = 0;
      let moodCount = 0;
      let thoughtsCount = 0;
      let diaryEntriesCount = 0;

      // Generate all dates in the week
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      weekDates.forEach(date => {
        const dayData = weekData[date];
        if (!dayData) return;

        // Count daily reports
        if (dayData.dailyReport?.summary?.trim()) {
          dailyReportsWritten++;
        }

        // Count completed tasks
        completedTasks += dayData.todos?.filter(todo => todo.completed).length || 0;

        // Calculate mood average
        if (dayData.dailyReport?.mood) {
          const moodValue = this.getMoodValue(dayData.dailyReport.mood);
          totalMood += moodValue;
          moodCount++;
        }

        // Count thoughts
        thoughtsCount += dayData.thoughts?.length || 0;

        // Count diary entries (if using separate diary entries)
        diaryEntriesCount += dayData.diary?.length || 0;
      });

      const moodAverage = moodCount > 0 ? totalMood / moodCount : 0;

      // Save to database
      const statsData = {
        week_start_date: weekStartDate,
        week_end_date: weekEnd.toISOString().split('T')[0],
        daily_reports_written: dailyReportsWritten,
        completed_tasks: completedTasks,
        mood_average: Number(moodAverage.toFixed(2)),
        thoughts_count: thoughtsCount,
        total_diary_entries: diaryEntriesCount,
        updated_at: new Date().toISOString()
      };

      if (!supabase) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('weekly_stats')
        .upsert(statsData, {
          onConflict: 'week_start_date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving weekly stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in calculateAndSaveWeeklyStats:', error);
      return null;
    }
  }

  private static getMoodValue(mood: string): number {
    switch (mood) {
      case '매우좋음': return 5;
      case '좋음': return 4;
      case '보통': return 3;
      case '나쁨': return 2;
      case '매우나쁨': return 1;
      default: return 3;
    }
  }

  static async deleteWeeklyStats(weekStartDate: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('weekly_stats')
        .delete()
        .eq('week_start_date', weekStartDate);

      if (error) {
        console.error('Error deleting weekly stats:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWeeklyStats:', error);
      return false;
    }
  }
}