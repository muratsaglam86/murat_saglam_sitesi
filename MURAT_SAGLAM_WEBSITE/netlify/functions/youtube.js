// Dosya Adı: netlify/functions/youtube.js

const { google } = require('googleapis');

// API Anahtarınızı Netlify arayüzünden ekleyeceksiniz.
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, 
});

exports.handler = async function (event, context) {
  const CHANNEL_ID = 'UCJCMjWwrW0g5aIyoYg1F-tg'; // Kanal ID'niz

  try {
    const channelResponse = await youtube.channels.list({
      part: 'contentDetails',
      id: CHANNEL_ID,
    });

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const playlistResponse = await youtube.playlistItems.list({
      playlistId: uploadsPlaylistId,
      part: 'snippet',
      maxResults: 100, // Buradan kaç video çekileceğini ayarlayabilirsiniz (Max 50)
    });

    const videos = playlistResponse.data.items
      .filter(item => item.snippet.title !== 'Private video' && item.snippet.thumbnails) // Gizli videoları filtrele
      .map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      }));

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=3600' }, // 1 saat önbellekle
      body: JSON.stringify(videos),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};