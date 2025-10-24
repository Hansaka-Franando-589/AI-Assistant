// hansaka_public_secretary_plugin.js
// This plugin acts as a public secretary for Hansaka Fernando.
// It replies to EVERYONE in private chat by default.

const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ✅ Bot Status
// This is now a GLOBAL switch. Only the owner can change it.
// Default: true (Bot is ON for everyone)
let globalAutoBotEnabled = true; 
const processedMsgs = new Set();
const GEMINI_API_KEY = "your api"; // 👈 ★★★★★ කරුණාකර ඔබගේ Gemini API Key එක මෙතන දාන්න ★★★★★

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🤖 HFS (Hansaka Fernando\'s Public Secretary) LOADED!  ║');
console.log('║                (Mode: Public / Replies to All)             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');


// 📚 Knowledge Base (Public Info about Mr. Hansaka Fernando)
// (Professional, Short & Decorated - For Public)
const knowledgeBase = {
  // --- Greetings & Help ---
  "හෙලෝ|හායි|ආයුබෝවන්|හලෝ|hello|hi|hey": 
    "✨ *Welcome!*\nමම Hansaka Fernando මහතාගේ AI ලේකම් (AI Secretary). 🤖\n\nඔබට අවශ්‍ය තොරතුරක් 'help' කියා type කර දැනගත හැක.",

  "help|උදව්|උදව": 
    "┌ 💡 *Mr. Hansaka's Info* 💡\n├──────────────\n│ 📧 `email`\n│ 💳 `nic`\n│ 🏦 `bank`\n│ 🏠 `address`\n│ 🔗 `links` / `contact`\n│ 👤 `status`\n├──────────────\n│ 💬 _AI ප්‍රශ්නයක් අසන්න..._\n└──────────────",

  "thanks|thank|ස්තූති|ස්තුති|thank you": 
    "😊 *You're welcome!*",

  // --- Personal Information (Static) ---
  "email|ඊමේල්|hansaka's email|hansaka email": 
    "📧 *Mr. Hansaka's Email:*\n`hansakafranando7@gmail.com`",

  "nic|id|hansaka's nic|hansaka id": 
    "💳 *Mr. Hansaka's NIC:*\n`200722400842`",

  "bank|බැංකුව|බෑන්ක්|hansaka's bank|boc": 
    "🏦 *Mr. Hansaka's Bank (BOC):*\n`0082607938`",

  "address|ලිපිනය|hansaka's address": 
    "🏠 *Mr. Hansaka's Address:*\n`Welyaya Rd, Hindurangala, Kiriella.`",

  "links|link|fb|facebook|whatsapp|contact|hansaka's contact": 
    "🔗 *Mr. Hansaka's Links:*\n  • *Facebook:* hansaka fernando\n  • *WhatsApp:* `0779912589`",
    
  "status|marrage|hansaka's status":
    "👤 *Mr. Hansaka's Status:*\n`Single`"
};


// Function to find a static answer from the Knowledge Base
function findAnswer(text) {
  const q = text.toLowerCase().trim();

  for (let keywords in knowledgeBase) {
    const keyList = keywords.split('|');
    for (let key of keyList) {
      if (q.includes(key.toLowerCase())) {
        const answer = knowledgeBase[keywords];
        return typeof answer === 'function' ? answer() : answer;
      }
    }
  }
  return null;
}

// Function to get a dynamic answer from Gemini AI
async function getAIResponse(question) {
  try {
    // ★★★★★ AI PROMPT - AIs "Secretary" Personality ★★★★★
    const prompt = `You are the professional AI Secretary for "Mr. Hansaka Fernando".
The user you are talking to is a visitor or client. DO NOT address them as "Mr. Hansaka".

Your job is to answer questions *about* Mr. Hansaka Fernando.

IMPORTANT CONTEXT about Mr. Hansaka Fernando (You can share this):
- He is a Full-Stack Web Developer and a Programmer.
- He is skilled in AI and Machine Learning.
- He is a professional programmer.
- He loves coding.

VISITOR'S QUESTION: "${question}"

Instructions for your response:
1.  Be *professional, brief, and polite.*
2.  Use WhatsApp formatting (*bold*, _italics_, \`monospace\`) and relevant emojis (like ✨, 💡, 👨‍💻) to make the response clear.
3.  If the user asks for information *not* listed above (like his age, or other private details), you must politely decline.
4.  Answer in the SAME language the user asked in (Sinhala or English).`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      { 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      },
      { timeout: 10000 }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (e) {
    console.error('⚠️  AI Error:', e.message);
    return null;
  }
}

// 🎯 MAIN AUTO-REPLY HANDLER (text only)
cmd({
  on: "body"
}, async (conn, mek, m, { from, body, isGroup, isOwner }) => {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 NEW MESSAGE RECEIVED (HFS-SECRETARY)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 From: ${from}`);
    console.log(`📱 Is Group: ${isGroup}`);
    console.log(`🤖 Global Auto-reply: ${globalAutoBotEnabled}`);
    console.log(`💬 Body: ${body?.substring(0, 50) || 'No body'}`);
    
    // We only reply in private chats (not groups)
    if (isGroup) {
      console.log('⏭️  Skipping: Group message');
      return;
    }
    
    // This is the GLOBAL master switch. Only Owner can change this.
    if (!globalAutoBotEnabled) {
      console.log('⏭️  Skipping: Global Auto-Reply is DISABLED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    const msgId = mek.key?.id;
    if (!msgId) {
      console.log('⏭️  No message ID found');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }
    
    if (processedMsgs.has(msgId)) {
      console.log('⏭️  Already processed this message');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }
    
    processedMsgs.add(msgId);
    console.log(`   Message ID added to processed set (size: ${processedMsgs.size})`);
    
    // Memory cleanup
    if (processedMsgs.size > 500) {
      const arr = Array.from(processedMsgs);
      const toDelete = arr.slice(0, 250);
      toDelete.forEach(id => processedMsgs.delete(id));
      console.log(`   🗑️  Cleaned up ${toDelete.length} old message IDs`);
    }

    // Don't reply to own messages
    if (mek.key?.fromMe) {
      console.log('⏭️  Own message, skipping');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Skip if image
    const hasDirectImage = !!mek.message?.imageMessage;
    const hasQuotedImage = !!mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    
    if (hasDirectImage || hasQuotedImage) {
      console.log('⏭️  Image detected - skipping');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Regular text message auto-reply logic
    console.log('\n💬 TEXT MESSAGE - AUTO-REPLY PROCESSING');
    
    const text = body || "";
    if (!text || text.trim().length < 2) {
      console.log('⏭️  No text or too short');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Check if the message is a command. IF IT IS, skip auto-reply
    // (This allows the Owner to use .autobot off)
    if (text.startsWith('.') || text.startsWith('!') || text.startsWith('/') || text.startsWith('#')) {
      console.log('⏭️  Command detected, skipping auto-reply');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    const userNum = from.split('@')[0];
    console.log(`   Processing text from (public): ${userNum}`);
    console.log(`   Text: "${text.substring(0, 100)}"`);

    let answer = null;

    // 1. Try FAQ (Knowledge Base) first
    console.log('   🔍 Searching in Knowledge Base (FAQ)...');
    answer = findAnswer(text);

    if (answer) {
      console.log('   ✅ Found answer in FAQ!');
    } else {
      // 2. If not in FAQ, use AI (Gemini)
      console.log('   🤖 Not in FAQ. Asking AI (Gemini)...');
      answer = await getAIResponse(text);

      if (answer) {
        console.log('   ✅ Got AI response!');
      } else {
        // 3. Fallback (Updated Style)
        console.log('   ⚠️  AI Error or no response. Using fallback.');
        answer = "⚠️ *Processing Error*\nI apologize, I couldn't process that request at the moment. Please try again shortly.";
      }
    }

    console.log('   📤 Sending reply...');
    await m.reply(answer);
    console.log('   ✅ Reply sent successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌❌❌ ERROR IN AUTO-REPLY ❌❌❌');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
});

// 🎛️ Control Command - Enable/Disable Auto-Reply
// ★★★ THIS COMMAND IS FOR THE OWNER ONLY ★★★
cmd({
  pattern: "autobot",
  desc: "Globally Enable/Disable the Secretary Bot",
  category: "admin",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isOwner }) => {
  try {
    console.log(`\n🎛️  GLOBAL AUTOBOT command from: ${from}`);
    
    // Only the Owner can use this command
    if (!isOwner) {
      console.log('   ❌ Access denied - NOT OWNER\n');
      return reply("❌ This is an owner-only command!");
    }

    if (!args[0]) {
      const status = globalAutoBotEnabled ? '✅ *ON*' : '❌ *OFF*';
      console.log(`   Current global status: ${status}\n`);
      return reply(`🤖 *Global Secretary Bot Status:* ${status}\n_(Replies to everyone)_\n\n*Usage:*\n• \`.autobot on\`\n• \`.autobot off\``);
    }

    const cmd = args[0].toLowerCase();

    if (cmd === 'on' || cmd === 'enable') {
      globalAutoBotEnabled = true;
      console.log(`✅ Global Auto-reply ENABLED`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return reply('✅ *Global Secretary Bot ENABLED*\nI will now respond to *everyone*. 🤖');

    } else if (cmd === 'off' || cmd === 'disable') {
      globalAutoBotEnabled = false;
      console.log(`⏸️  Global Auto-reply DISABLED`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return reply('⏸️  *Global Secretary Bot DISABLED*\nI will no longer auto-respond to *anyone*. 🔕');

    } else {
      console.log('   ❌ Invalid option\n');
      return reply('❌ Invalid option!\n\n*Usage:*\n• \`.autobot on\`\n• \`.autobot off\`');
    }

  } catch (e) {
    console.error('❌ Error in autobot command:', e);
    return reply('❌ Error: ' + e.message);
  }
});

// ---------------------------------------------------
// Other commands (testauto) remain the same
// ---------------------------------------------------

// 🧪 Test Command
cmd({
  pattern: "testauto",
  desc: "Test auto-reply response",
  category: "admin",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  try {
    console.log('\n🧪 TESTAUTO command');
    
    const query = args.join(' ');

    if (!query) {
      return reply('📝 *Test Secretary Response*\n\n*Usage:* `.testauto <message>`\n\n*Example:*\n• `.testauto hansaka email`\n• `.testauto who is hansaka`');
    }

    console.log(`   Query: "${query}"`);

    let answer = findAnswer(query);

    if (answer) {
      console.log('   ✅ Found in FAQ\n');
      return reply(`✅ *Static Response (FAQ):*\n\n${answer}`);
    } else {
      console.log('   🤖 Using AI...');
      answer = await getAIResponse(query);

      if (answer) {
        console.log('   ✅ Got AI response\n');
        return reply(`🤖 *AI Response (Gemini):*\n\n${answer}`);
      } else {
        console.log('   ⚠️  No response\n');
        return reply('❌ No response generated.');
      }
    }
  } catch (e) {
    console.error('❌ Error in testauto:', e);
    return reply('❌ Test error: ' + e.message);
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Hansaka Fernando\'s Public Secretary loaded! (v3.0)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Commands available:');
console.log('   • .autobot on/off - Toggle Secretary (Owner Only)');
console.log('   • .testauto <msg> - Test responses');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 Secretary bot ready for auto-replies to all...\n');