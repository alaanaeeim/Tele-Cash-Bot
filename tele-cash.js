const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const token = "7685282467:AAHSOsYHitG4m099Ku_pzBCy7V8FCkUEg7I";
const bot = new TelegramBot(token, { polling: true });

const NBSP = '\u00A0';
const ADMIN_ID = 7046453429; // ✨ ضع ID الأدمن هنا

// 🔹 تحميل الإعدادات
let settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

// 🔹 حفظ الإعدادات
function saveSettings() {
  fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

// 🔹 حالة الأدمن
let adminState = {
  isEditing: false,
  tempNumber: null,
};

const response2 = `${NBSP.repeat(20)}🏦 <b>عنوان السحب</b> 🏦

💰 طريقة السحب <b>نقد</b>

📍 <i>المدينه</i> : <b>Cairo</b>

🏪 <i>الشارع</i> : <b>Al-Wafi Cash</b>

${NBSP.repeat(13)}💸${NBSP.repeat(8)}💸${NBSP.repeat(8)}💸${NBSP.repeat(8)}💸

📱 <b>ابعت الكود الى هيظهرلك</b>

💳 <b>ابعت رقم الكاش</b>`;

function buildResponse1() {
  return `
${NBSP.repeat(15)}💎 <b>Tele Cash</b> ترحب بك 💎

💸 <b>التحويل من فودافون كاش</b> :

📋 اضغط علي الرقم للنسخ 👇

${NBSP.repeat(20)}<code>${settings.phoneNumber}</code>${NBSP.repeat(10)}

✅ تم الشحن ♥️✨

شكراً عشان اخترت <b>Tele Cash</b> 💞

⚡ لضمان أسرع عملية من خلالنا اتبع الخطوات التالية 👇

🔸 ابعت اسكرين التحويل 📸  
🔸 الرقم الي اتحول منه الفلوس 📞  
 🎰 حساب اللاعب 🆔

⚠️ <b>تحذير</b> ‼️📢  
انا مش مسؤول لو بعت علي رقم قديم ❌

🔄 الأرقام بتتغير باستمرار  
💸 اسأل دايماً علي رقم الكاش المتاح للتحويل
`;
}

// 🟢 الأزرار (مع تبديل الأماكن)
function getKeyboard(userId) {
  let buttons = [[{ text: "سحب" }, { text: "شحن" }]];
  if (userId === ADMIN_ID) {
    buttons.push([{ text: "💾 حفظ الرقم" }, { text: "✏️ تغيير الرقم" }]);
  }
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      persistent: true,
      one_time_keyboard: false,
    },
  };
}

// بداية البوت
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `مرحباً بك في <b>Tele Cash</b> 💎

اختر العملية المطلوبة من الأزرار بالأسفل:`;
  
  bot.sendMessage(msg.chat.id, welcomeMessage, {
    parse_mode: 'HTML',
    ...getKeyboard(msg.from.id)
  });
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText && messageText.startsWith('/')) {
    return;
  }

if (adminState.isEditing && msg.from.id === ADMIN_ID && !["✏️ تغيير الرقم","💾 حفظ الرقم"].includes(messageText)) {
  adminState.tempNumber = messageText;
  bot.sendMessage(
    chatId, 
    `📌 الرقم الجديد هو: <code>${adminState.tempNumber}</code>\n\n اضغط على <b>💾 حفظ الرقم</b> لتأكيد الرقم الجديد`, 
    { parse_mode: "HTML", ...getKeyboard(msg.from.id) }
  );
  return;
}

  switch (messageText) {
    case "شحن":
      bot.sendMessage(chatId, buildResponse1(), { parse_mode: "HTML", ...getKeyboard(msg.from.id) });
      break;

    case "سحب":
      bot.sendMessage(chatId, response2, { parse_mode: "HTML", ...getKeyboard(msg.from.id) });
      break;

    case "✏️ تغيير الرقم":
      if (msg.from.id !== ADMIN_ID) return;
      adminState.isEditing = true;
      bot.sendMessage(chatId, "✏️ اكتب الرقم الجديد الآن:", getKeyboard(msg.from.id));
      break;

    case "💾 حفظ الرقم":
      if (msg.from.id !== ADMIN_ID) return;
      if (adminState.tempNumber) {
        settings.phoneNumber = adminState.tempNumber;
        saveSettings();
        adminState.isEditing = false;
        bot.sendMessage(chatId, `✅ تم حفظ الرقم الجديد: <code>${settings.phoneNumber}</code>`, { parse_mode: "HTML", ...getKeyboard(msg.from.id) });
      } else {
        bot.sendMessage(chatId, "⚠️ لم يتم إدخال أي رقم جديد.", getKeyboard(msg.from.id));
      }
      break;

    default:
      // ❌ مفيش أي رد هنا عشان مايبعتش "تم استلام رسالتك"
      break;
  }
});

// Error handling
bot.on('error', (error) => {
  console.log('Bot error:', error.message);
});

bot.on('polling_error', (error) => {
  console.log('Connection error:', error.message);
});
