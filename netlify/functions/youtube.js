// Dosya Adı: netlify/functions/youtube.js (GEÇİCİ TEST KODU)

const { google } = require('googleapis');

// --- DEĞİŞİKLİK BURADA ---
// API anahtarını GEÇİCİ olarak doğrudan buraya yazıyoruz.
const MY_API_KEY = "AIzaSyCZQzpDeVU1OpyHoHXFth8StV6gtzr0nsM";

const youtube = google.youtube({
  version: 'v3',
  auth: MY_API_KEY, // process.env.YOUTUBE_API_KEY yerine direkt anahtarı kullan
});

exports.handler = async function (event, context) {
  const CHANNEL_ID = 'UCJCMjWwrW0g5aIyoYg1F-tg';

  try {
    const channelResponse = await youtube.channels.list({
      part: 'contentDetails',
      id: CHANNEL_ID,
    });

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
      body: JSON.stringify(videos),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        message: "HATA (KOD İÇİNDEKİ ANAHTARLA)",
        errorDetails: error.errors || error.toString(),
      }) 
    };
  }
};
