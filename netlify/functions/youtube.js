// Dosya Adı: netlify/functions/youtube.js (YENİ KOD)

const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, 
});

exports.handler = async function (event, context) {
  const CHANNEL_ID = 'UCJCMjWwrW0g5aIyoYg1F-tg';

  try {
    const channelResponse = await youtube.channels.list({
      part: 'contentDetails',
      id: CHANNEL_ID,
    });
    
    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error(`Google API, bu Kanal ID'si için bir sonuç döndürmedi. ID'yi kontrol edin.`);
    }

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const playlistResponse = await youtube.playlistItems.list({
      playlistId: uploadsPlaylistId,
      part: 'snippet',
      maxResults: 50,
    });

    const videos = playlistResponse.data.items
      .filter(item => item.snippet.title !== 'Private video' && item.snippet.thumbnails)
      .map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      }));

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify(videos),
    };
  } catch (error) {
    // Hata durumunda daha detaylı bilgi döndür
    console.error(error); 
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        message: "YouTube'dan video çekerken bir hata oluştu.",
        // Google'dan gelen spesifik hata mesajlarını da ekliyoruz
        errorDetails: error.errors || error.toString(),
      }) 
    };
  }
};
