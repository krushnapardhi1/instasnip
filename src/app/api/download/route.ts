import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateInstagramUrl, getClientIp, cleanInstagramUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const ipAddress = getClientIp(req);
  let requestUrl = '';

  try {
    const body = await req.json();
    requestUrl = body.url ? cleanInstagramUrl(body.url.trim()) : '';

    // 1. Validate URL
    if (!requestUrl || !validateInstagramUrl(requestUrl)) {
      // Log failed download in DB
      await prisma.downloadLog.create({
        data: {
          url: requestUrl || 'empty-or-invalid',
          ipAddress,
          status: 'FAILED',
          errorMsg: 'Invalid Instagram URL format',
        },
      });

      return NextResponse.json(
        { error: 'Please enter a valid Instagram Reel or Video link (e.g., https://www.instagram.com/reel/...) ' },
        { status: 400 }
      );
    }

    // 2. Load Settings from DB
    const settings = await prisma.setting.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));

    const rapidApiKey = settingsMap.get('rapidapi_key') || '';
    const rapidApiHost = settingsMap.get('rapidapi_host') || 'instagram-downloader-download-instagram-videos-post-reel-stories.p.rapidapi.com';
    
    // Default to mock mode if key is missing or explicitly enabled
    const mockModeSetting = settingsMap.get('mock_mode');
    const isMockMode = mockModeSetting ? mockModeSetting === 'true' : !rapidApiKey;

    // 3. Scraping logic
    if (isMockMode) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResponse = {
        success: true,
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
        caption: '✨ Exploring the neon streets. Capturing high quality moments! 🌌🎬 #aesthetic #reels #explore',
        downloadUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-pasting-by-a-wall-40454-large.mp4',
        filename: `instagram_downloader_${Date.now()}.mp4`,
        isMock: true
      };

      // Log success in DB
      await prisma.downloadLog.create({
        data: {
          url: requestUrl,
          ipAddress,
          status: 'SUCCESS',
        },
      });

      return NextResponse.json(mockResponse);
    } else {
      // Call RapidAPI Instagram Downloader API
      // Standard endpoint for many Instagram video downloaders on RapidAPI
      const apiUrl = `https://${rapidApiHost}/index?url=${encodeURIComponent(requestUrl)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost,
        },
        // 8 second timeout
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Scraper API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Attempt to parse standard RapidAPI structures
      // Usually it returns: { thumbnail: "...", download_url: "...", caption: "..." }
      // or nested response objects like result.edges[0].node
      const node = data.result?.edges?.[0]?.node;

      const downloadUrl = data.download_url 
        || data.video_url 
        || (data.links && data.links[0]?.url) 
        || (data.media && data.media[0]) 
        || node?.video_versions?.[0]?.url
        || '';
        
      const thumbnail = data.thumbnail 
        || data.thumbnail_url 
        || (data.links && data.links[0]?.thumbnail) 
        || node?.image_versions2?.candidates?.[0]?.url 
        || '';
        
      const caption = node?.caption?.text
        || data.caption?.text
        || data.caption 
        || data.title 
        || 'Instagram Video';

      if (!downloadUrl) {
        throw new Error('Could not find download URL in the API response. The video might be private or deleted.');
      }

      // Log success in DB
      await prisma.downloadLog.create({
        data: {
          url: requestUrl,
          ipAddress,
          status: 'SUCCESS',
        },
      });

      return NextResponse.json({
        success: true,
        thumbnail,
        caption,
        downloadUrl,
        filename: `instagram_downloader_${Date.now()}.mp4`,
        isMock: false
      });
    }

  } catch (error: any) {
    console.error('Download API Error:', error);
    
    // Log failure in DB
    await prisma.downloadLog.create({
      data: {
        url: requestUrl || 'unknown',
        ipAddress,
        status: 'FAILED',
        errorMsg: error.message || 'Unknown server error',
      },
    });

    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the video. Please try again later.' },
      { status: 500 }
    );
  }
}
