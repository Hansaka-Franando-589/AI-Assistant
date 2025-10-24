// hansaka_song_downloader_plugin.js
// Version 4.0 (Language: English, Style: Fancy Fonts)

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require("axios");

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║ 🚀 HFA Song Downloader Plugin LOADED! (Fancy Style) ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// ★★★★★ HANSKA FERNANDO - AI SECRETARY THEME (FANCY FONTS) ★★★★★
const secretaryTheme = {
  header: `╭─── 𝓐𝓓𝓥𝓐𝓝𝓒𝓔D 𝓐𝓘 𝓢𝓔𝓒𝓡𝓔𝓣𝓐𝓡𝓨 ───╮
│ 🤵 𝓗𝓪𝓷𝓼𝓪𝓴𝓪 𝓕𝓮𝓻𝓷𝓪𝓷𝓭𝓸 (𝓜𝓾𝓼𝓲𝓬 𝓢𝓮𝓻𝓿𝓲𝓬𝓮)
╰────────────────────────────────╯`,
  
  box: function(title, content) {
    // This function creates the formatted box
    return `${this.header}

┌ 🎵 *${title.toUpperCase()}*
│
${content}
│
└ 𝓟𝓸𝔀𝓮𝓻𝓮𝓭 𝓫𝔂 𝓗𝓕𝓐-𝓐𝓘`;
  },
  
  // Emojis for search results
  resultEmojis: ["🎼", "🎧", "🎵", "🎶", "🎤", "🎹"]
};

// Function to download with retries (from original plugin)
async function fetchSongWithRetries(apiUrl, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching from ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.data.success && response.data.result && response.data.result.download_url) {
        console.log(`Attempt ${attempt}: Success! Got download URL`);
        return response;
      } else {
        console.warn(`Attempt ${attempt}: API returned success but no download URL`);
        console.log(JSON.stringify(response.data));
      }
    } catch (error) {
      console.error(`API attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw new Error("All API attempts failed");
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  throw new Error("Failed to get valid response after all attempts");
}

// ★★★★★ SONG COMMAND (ENGLISH) ★★★★★
cmd({
    pattern: "song",
    alias: ["music", "play", "සින්දු"], // Kept Sinhala alias just in case
    desc: "Download music via the AI Secretary.",
    react: "🎵",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        q = q ? q : ''; // Ensure q is not undefined
        if (!q) {
            // ★★★ ENGLISH RESPONSE ★★★
            return reply(secretaryTheme.box("𝓜𝓾𝓼𝓲𝓬 𝓖𝓾𝓲𝓭𝓮", 
                `🎵 *Usage:* .song <song name>\n` +
                `🎵 *Example:* .song Let It Go\n` +
                `🎵 *Returns:* Music from YouTube`));
        }

        // Send searching reaction
        await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
            // ★★★ ENGLISH RESPONSE ★★★
            return reply(secretaryTheme.box("𝓢𝓮𝓪𝓻𝓬𝓱 𝓔𝓻𝓻𝓸𝓻", 
                `⚠️ *Error:* No music found for your query.\n` +
                `The music archive is unavailable.\n` +
                `Please try again.`));
        }

        const data = search.videos[0];
        const url = data.url;

        const randomEmoji = secretaryTheme.resultEmojis[Math.floor(Math.random() * secretaryTheme.resultEmojis.length)];

        // ★★★ ENGLISH RESPONSE ★★★
        let songDetails = `🎵 *Title:* ${data.title}\n\n`;
        songDetails += `🎤 *Artist:* ${data.author.name}\n`;
        songDetails += `👁️ *Views:* ${data.views}\n`;
        songDetails += `⏱️ *Duration:* ${data.timestamp}\n`;
        songDetails += `📅 *Uploaded:* ${data.ago}\n\n`;
        songDetails += `*✧ 𝓒𝓱𝓸𝓸𝓼𝓮 𝓓𝓸𝔀𝓷𝓵𝓸𝓪𝓭 𝓕𝓸𝓻𝓶𝓪𝓽 ✧*\n\n`;
        songDetails += `*1* 🎧 Audio (High Quality)\n`;
        songDetails += `*2* 📁 Document (Audio File)\n`;
        songDetails += `*3* 🎤 Voice Note (Quick Listen)\n`;
        songDetails += `*4* 📹 Video (Full HD)\n`;
        songDetails += `*5* 🎬 Video Note (Quick View)\n\n`;
        // ★★★ FANCY FONT CREDIT ★★★
        songDetails += `🤵 𝓟𝓞𝓦𝓔𝓡𝓔𝓓 𝓑𝓨 𝓜𝓡. 𝓗𝓐𝓝𝓢𝓐𝓚𝓐 𝓕𝓔𝓡𝓝𝓐𝓝𝓓𝓞 🤵`;

        let thumbnailUrl = data.thumbnail;
        try {
            await axios.head(thumbnailUrl, { timeout: 5000 });
        } catch (error) {
            console.warn(`Video thumbnail failed: ${error.message}, using fallback`);
            thumbnailUrl = "https://i.ytimg.com/vi_default.jpg"; 
        }

        const sentMsg = await conn.sendMessage(from, {
            image: { url: thumbnailUrl },
            caption: secretaryTheme.box("𝓜𝓾𝓼𝓲𝓬 𝓕𝓸𝓾𝓷𝓭", songDetails)
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Update reaction to show found state
        await conn.sendMessage(from, { react: { text: randomEmoji, key: mek.key } });

        const messageListener = async (messageUpdate) => {
            try {
                const mek = messageUpdate.messages[0];
                if (!mek.message) return;

                const messageType = mek.message.conversation || (mek.message.extendedTextMessage && mek.message.extendedTextMessage.text);
                if (!messageType) return;

                const fromReply = mek.key.remoteJid;
                const senderReply = mek.key.participant || mek.key.remoteJid;

                const isReplyToSentMsg = mek.message.extendedTextMessage && 
                                         mek.message.extendedTextMessage.contextInfo && 
                                         mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

                if (isReplyToSentMsg) {
                    if (['1', '2', '3', '4', '5'].includes(messageType)) {
                        await conn.sendMessage(fromReply, { react: { text: "⏳", key: mek.key } });

                        const audioApiUrl = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(url);
                        const videoApiUrl = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(url);
                        
                        let response;
                        let downloadUrl;
                        
                        try {
                            if (messageType === '1' || messageType === '2' || messageType === '3') {
                                response = await fetchSongWithRetries(audioApiUrl);
                                downloadUrl = response.data.result.download_url;
                            } else {
                                response = await fetchSongWithRetries(videoApiUrl);
                                downloadUrl = response.data.result.download_url;
                            }
                        } catch (error) {
                            console.error(`API failed: ${error.message}`);
                            await conn.sendMessage(fromReply, { react: { text: "❌", key: mek.key } });
                            // ★★★ ENGLISH RESPONSE ★★★
                            return reply(secretaryTheme.box("𝓓𝓸𝔀𝓷𝓵𝓸𝓪𝓭 𝓔𝓻𝓻𝓸𝓻", 
                                `⚠️ *Error:* Failed to download "${q}"\n` +
                                `The download service is unavailable.\n` +
                                `Please try again later.`));
                        }

                        if (messageType === '1') { // Audio
                            await conn.sendMessage(fromReply, {
                                audio: { url: downloadUrl },
                                mimetype: "audio/mpeg",
                                fileName: `${data.title}.mp3`,
                                contextInfo: {
                                    externalAdReply: {
                                        title: data.title,
                                        // ★★★ FANCY FONT CREDIT ★★★
                                        body: "Hansaka Fernando Secretary Service", 
                                        thumbnailUrl: thumbnailUrl,
                                        sourceUrl: data.url
                                    }
                                }
                            }, { quoted: mek });
                        } else if (messageType === '2') { // Document
                            // ★★★ ENGLISH RESPONSE ★★★
                            await conn.sendMessage(fromReply, {
                                document: { url: downloadUrl },
                                mimetype: "audio/mp3",
                                fileName: `${data.title}.mp3`,
                                caption: secretaryTheme.box("𝓐𝓾𝓭𝓲𝓸 𝓐𝓻𝓬𝓱𝓲𝓿𝓮",
                                    `🎵 *${data.title}*\n\n> Sent as a document file.`)
                            }, { quoted: mek });
                        } else if (messageType === '3') { // Voice Note
                            await conn.sendMessage(fromReply, {
                                audio: { url: downloadUrl },
                                mimetype: "audio/mp4",
                                ptt: true,
                                fileName: `${data.title}.mp3`
                            }, { quoted: mek });
                        } else if (messageType === '4') { // Video
                            // ★★★ ENGLISH RESPONSE ★★★
                            await conn.sendMessage(fromReply, {
                                video: { url: downloadUrl },
                                // ★★★ FANCY FONT CREDIT ★★★
                                caption: `🎵 *${data.title}*\n🎤 By: ${data.author.name}\n\n🤵 𝓗𝓪𝓷𝓼𝓪𝓴𝓪 𝓕𝓮𝓻𝓷𝓪𝓷𝓭𝓸 𝓥𝓲𝓭𝓮𝓸 𝓢𝓮𝓻𝓿𝓲𝓬𝓮 🤵`,
                                mimetype: "video/mp4",
                                fileName: `${data.title}.mp4`
                            }, { quoted: mek });
                        } else if (messageType === '5') { // Video Note
                            // ★★★ ENGLISH RESPONSE ★★★
                            await conn.sendMessage(fromReply, {
                                video: { url: downloadUrl },
                                caption: `🎵 *${data.title}*\n🎤 𝓠𝓾𝓲𝓬𝓴 𝓥𝓲𝓭𝓮𝓸 𝓝𝓸𝓽𝓮`,
                                mimetype: "video/mp4",
                                fileName: `${data.title}_note.mp4`,
                                ptv: true, 
                                gifPlayback: false
                            }, { quoted: mek });
                        }

                        // Success reaction
                        await conn.sendMessage(fromReply, { 
                            react: { 
                                text: messageType === '1' ? "🎵" : 
                                      messageType === '2' ? "📁" : 
                                      messageType === '3' ? "🎤" : 
                                      messageType === '4' ? "📹" : "🎬", 
                                key: mek.key 
                            } 
                        });
                    } else {
                        await conn.sendMessage(fromReply, { react: { text: "❓", key: mek.key } });
                        // ★★★ ENGLISH RESPONSE ★★★
                        reply(secretaryTheme.box("𝓘𝓷𝓿𝓪𝓵𝓲𝓭 𝓞𝓹𝓽𝓲𝓸𝓷", 
                            `⚠️ *Your selection is invalid!*\n` +
                            `Please reply with a number from 1 to 5.`));
                    }
                }
            } catch (error) {
                console.error("Error in message listener:", error.message);
            }
        };

        conn.ev.on('messages.upsert', messageListener);

        setTimeout(() => {
            try {
                if (conn.ev && typeof conn.ev.off === 'function') {
                    conn.ev.off('messages.upsert', messageListener);
                    console.log("Successfully removed song listener (English)");
                }
            } catch (err) {
                console.error("Error removing song listener:", err.message);
            }
        }, 5 * 60 * 1000);

    } catch (e) {
        console.error("Error in Song command:", e.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        // ★★★ ENGLISH RESPONSE ★★★
        reply(secretaryTheme.box("𝓢𝔂𝓼𝓽𝓮𝓶 𝓔𝓻𝓻𝓸𝓻", 
            `⚠️ *Error:* ${e.message || "An unknown error occurred"}\n` +
            `The music service has encountered a problem.\n` +
            `Please try again later.`));
    }
});