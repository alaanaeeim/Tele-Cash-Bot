const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const token = "8244287705:AAHhJoxZrr-O_hhvvbrUfAFGXrGmcMqrBOE";
const bot = new TelegramBot(token, { polling: true });

const NBSP = "\u00A0";

// 🔹 قائمة الأدمنز
const ADMIN_IDS = [7046453429, 8183967382];

// 🔹 تحميل الإعدادات
let settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

// 🔹 حفظ الإعدادات
function saveSettings() {
  fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

// 🔹 حفظ سجل التغييرات
function saveLog(adminName, oldNumber, newNumber) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminName,
    oldNumber,
    newNumber,
  };
  fs.appendFileSync("phone_numbers_log.txt", JSON.stringify(logEntry) + "\n");
}

// 🔹 التحقق إذا المستخدم أدمن
function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

// 🔹 حالة الأدمن
let adminState = {
  isEditing: false,
  tempNumber: null,
};

// 🟢 رسالة السحب المنسقة
const responseWithdrawSingle = {
  text: `
${NBSP.repeat(12)}🏦 <b>عنوان السحب</b> 🏦

${NBSP.repeat(2)}💰 <b>طريقة السحب:</b> ${NBSP.repeat(2)}<b>نقد</b>
${NBSP.repeat(2)}📍 <b>المدينة:</b> ${NBSP.repeat(7)}<b>Cairo</b>
${NBSP.repeat(2)}🏪 <b>الشارع:</b> ${NBSP.repeat(6)}<b>Al-Wafi Cash</b>

${NBSP.repeat(8)}💸💸💸💸💸

💬 <b>بعد ما يكون كود السحب جاهز</b>  
<b>✉️ أرسل:</b>
${NBSP.repeat(4)}• <b>كود السحب 💳</b>  
${NBSP.repeat(4)}• <b>رقم الكاش 📱</b>
`,
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "📤 ابعت بيانات السحب",
          url: "https://t.me/Mirajojo12",
        },
      ],
    ],
  },
};

// 🟢 رسالة الشحن المنسقة
function buildRechargeSingle() {
  return {
    text: `
${NBSP.repeat(15)}💎 <b>Tele Cash</b> ترحب بك 💎

${NBSP.repeat(2)}💸 <b>التحويل من فودافون كاش:</b>
📋 اضغط على الرقم للنسخ 👇

${NBSP.repeat(25)}<b><code>${settings.phoneNumber}</code></b>${NBSP.repeat(10)}

💬 <b>بعد التحويل اضغط على الزر بالأسفل لإرسال بيانات الشحن</b>

<b>✉️ أرسل:</b>
${NBSP.repeat(5)}• <b>تم الشحن</b>  
${NBSP.repeat(4)}• <b>اسكرين التحويل 📸</b>  
${NBSP.repeat(4)}• <b>الرقم اللي اتحول منه الفلوس 📞</b>  
${NBSP.repeat(4)}• <b>حساب اللاعب 🆔</b>

⚠️ <b>تحذير:</b>  
انا مش مسؤول لو بعت على رقم قديم ❌  
🔄 الأرقام بتتغير باستمرار، اسأل دايمًا على الرقم المتاح.
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📤 ابعت بيانات الشحن",
            url: "https://t.me/Mirajojo12",
          },
        ],
      ],
    },
  };
}

const contactButtonOnly = {
  text: "\u200B",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "💬 تواصل معانا",
          url: "https://t.me/Mirajojo12",
        },
      ],
    ],
  },
};

// 🟢 لوحة الأزرار الرئيسية
function getKeyboard(userId) {
  let buttons = [[{ text: "سحب" }, { text: "شحن" }]];
  if (isAdmin(userId)) {
    buttons.push([{ text: "💾 حفظ الرقم" }, { text: "✏️ تغيير الرقم" }]);
  }
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      persistent: true,
    },
  };
}

// 🟢 بدء البوت
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `مرحباً بك في <b>Tele Cash</b> 💎

اختر العملية المطلوبة من الأزرار بالأسفل:`;
  bot.sendMessage(msg.chat.id, welcomeMessage, {
    parse_mode: "HTML",
    ...getKeyboard(msg.from.id),
  });
});

// 🟢 استقبال الرسائل
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  // 🟣 وضع تعديل الرقم للأدمن
  if (
    adminState.isEditing &&
    isAdmin(msg.from.id) &&
    !["✏️ تغيير الرقم", "💾 حفظ الرقم"].includes(text)
  ) {
    adminState.tempNumber = text;
    bot.sendMessage(
      chatId,
      `📌 الرقم الجديد هو: <code>${adminState.tempNumber}</code>\n\nاضغط على 💾 حفظ الرقم لتأكيد التغيير.`,
      { parse_mode: "HTML", ...getKeyboard(msg.from.id) }
    );
    return;
  }

  // 🟢 الحالات المختلفة
  switch (text) {
    case "شحن":
      bot.sendMessage(
        chatId,
        buildRechargeSingle().text,
        buildRechargeSingle()
      );
      break;

    case "سحب":
      bot.sendMessage(
        chatId,
        responseWithdrawSingle.text,
        responseWithdrawSingle
      );
      break;

    case "✏️ تغيير الرقم":
      if (!isAdmin(msg.from.id))
        return bot.sendMessage(chatId, "⛔ ليس لديك صلاحية لاستخدام هذا الأمر");
      adminState.isEditing = true;
      bot.sendMessage(
        chatId,
        "✏️ اكتب الرقم الجديد الآن:",
        getKeyboard(msg.from.id)
      );
      break;

    case "💾 حفظ الرقم":
      if (!isAdmin(msg.from.id))
        return bot.sendMessage(chatId, "⛔ ليس لديك صلاحية لاستخدام هذا الأمر");

      if (adminState.tempNumber) {
        const oldNumber = settings.phoneNumber;
        settings.phoneNumber = adminState.tempNumber;
        saveSettings();
        adminState.isEditing = false;

        // 🟢 فقط رسالة تأكيد محلية بدون إشعار
        bot.sendMessage(
          chatId,
          `✅ تم تغيير الرقم بنجاح إلى:\n\n📞 <code>${settings.phoneNumber}</code>`,
          { parse_mode: "HTML" }
        );

        saveLog(msg.from.first_name, oldNumber, adminState.tempNumber);
      } else {
        bot.sendMessage(chatId, "⚠️ لم يتم إدخال أي رقم جديد.");
      }
      break;

    // 🟣 أي رسالة غير مفهومة → يظهر زر تواصل معانا فقط
    default:
      if (!isAdmin(msg.from.id)) {
        bot.sendMessage(chatId, "\u200B", contactButtonOnly);
      }
      break;
  }
});

// 🟢 Error Handling
bot.on("polling_error", (err) => console.log("Polling error:", err.message));
console.log("✅ Bot is running...");
