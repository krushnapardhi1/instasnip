import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));

    const rapidApiKey = settingsMap.get('rapidapi_key') || '';
    const maskedKey = rapidApiKey 
      ? `${rapidApiKey.substring(0, 4)}••••••••${rapidApiKey.substring(rapidApiKey.length - 4)}` 
      : '';

    return NextResponse.json({
      rapidapi_key: maskedKey,
      hasKey: !!rapidApiKey,
      rapidapi_host: settingsMap.get('rapidapi_host') || 'instagram-downloader-download-instagram-videos-post-reel-stories.p.rapidapi.com',
      mock_mode: settingsMap.get('mock_mode') === 'true',
    });
  } catch (error) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rapidapi_key, rapidapi_host, mock_mode } = await req.json();

    // 1. Update rapidapi_key if it is not the masked placeholder
    if (rapidapi_key !== undefined && !rapidapi_key.includes('••••••••')) {
      await prisma.setting.upsert({
        where: { key: 'rapidapi_key' },
        update: { value: rapidapi_key.trim() },
        create: { key: 'rapidapi_key', value: rapidapi_key.trim() },
      });
    }

    // 2. Update rapidapi_host
    if (rapidapi_host !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'rapidapi_host' },
        update: { value: rapidapi_host.trim() },
        create: { key: 'rapidapi_host', value: rapidapi_host.trim() },
      });
    }

    // 3. Update mock_mode
    if (mock_mode !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'mock_mode' },
        update: { value: String(mock_mode) },
        create: { key: 'mock_mode', value: String(mock_mode) },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
