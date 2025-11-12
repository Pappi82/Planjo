import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all activity logs for the period
    const activities = await ActivityLog.find({
      userId: session.user.id,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    // Calculate streak
    const uniqueDates = new Set(
      activities.map((a) => new Date(a.createdAt).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate max streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Get completed tasks
    const completedTasks = await Task.find({
      userId: session.user.id,
      completedAt: { $gte: startDate, $ne: null },
    });

    // Calculate velocity (tasks per week)
    const weeklyVelocity: { [key: string]: number } = {};
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const week = getWeekNumber(new Date(task.completedAt));
        weeklyVelocity[week] = (weeklyVelocity[week] || 0) + 1;
      }
    });

    // Calculate productivity by hour
    const hourlyActivity: { [hour: number]: number } = {};
    activities.forEach((activity) => {
      const hour = new Date(activity.createdAt).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Get most productive hour
    let mostProductiveHour = 0;
    let maxActivity = 0;
    Object.entries(hourlyActivity).forEach(([hour, count]) => {
      if (count > maxActivity) {
        maxActivity = count;
        mostProductiveHour = parseInt(hour);
      }
    });

    return NextResponse.json({
      streak: {
        current: currentStreak,
        max: maxStreak,
      },
      tasksCompleted: completedTasks.length,
      weeklyVelocity,
      mostProductiveHour,
      hourlyActivity,
      activeDays: uniqueDates.size,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getWeekNumber(date: Date): string {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}
