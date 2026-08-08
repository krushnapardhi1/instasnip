import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Total Downloads
    const totalDownloads = await prisma.downloadLog.count({
      where: { status: 'SUCCESS' },
    });

    // 2. Failed Requests
    const failedRequests = await prisma.downloadLog.count({
      where: { status: 'FAILED' },
    });

    // 3. Active Users Today (Unique IPs in the last 24h)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const activeUsersTodayResult = await prisma.downloadLog.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        ipAddress: true,
      },
      distinct: ['ipAddress'],
    });
    const activeUsersToday = activeUsersTodayResult.length;

    // 4. Recent Logs (last 100)
    const recentLogs = await prisma.downloadLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    // 5. Download History for last 7 days (trend chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logsLast7Days = await prisma.downloadLog.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        timestamp: true,
        status: true,
      },
    });

    // Format trend data
    const trendDataMap: { [key: string]: { date: string; success: number; failed: number } } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      trendDataMap[key] = { date: dateString, success: 0, failed: 0 };
    }

    // Populate counts
    logsLast7Days.forEach((log) => {
      const key = log.timestamp.toISOString().split('T')[0];
      if (trendDataMap[key]) {
        if (log.status === 'SUCCESS') {
          trendDataMap[key].success += 1;
        } else {
          trendDataMap[key].failed += 1;
        }
      }
    });

    const chartData = Object.values(trendDataMap);

    // 6. RapidAPI Status Check
    const settings = await prisma.setting.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));
    
    const rapidApiKey = settingsMap.get('rapidapi_key') || '';
    const mockModeSetting = settingsMap.get('mock_mode');
    const isMockMode = mockModeSetting ? mockModeSetting === 'true' : !rapidApiKey;

    let apiStatus = 'ACTIVE';
    if (isMockMode) {
      apiStatus = 'MOCK_FALLBACK';
    } else if (!rapidApiKey) {
      apiStatus = 'NOT_CONFIGURED';
    }

    return NextResponse.json({
      stats: {
        totalDownloads,
        activeUsersToday,
        failedRequests,
        successRate: totalDownloads + failedRequests > 0 
          ? Math.round((totalDownloads / (totalDownloads + failedRequests)) * 100) 
          : 100,
      },
      apiStatus,
      chartData,
      recentLogs,
    });

  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
