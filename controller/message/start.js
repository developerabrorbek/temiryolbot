const { bot } = require("../../bot");
const { log_msg, remove_msg } = require("../../helper/msg");
const User = require("../../model/user");
const lang = require("../../helper/lang");
const user = require("../../model/user");
const { welcome } = require("./welcome");
const { end_review } = require("./review");

const start = async (msg) => {
  const chat_id = msg.from.id;
  await remove_msg(chat_id);

  let user = (await User.findOne({ chat_id }).lean()) || null;
  if (user) {
    await welcome(msg);
  } else {
    await choose_language(msg);
  }
};

const choose_language = async (msg) => {
  const chat_id = msg.from.id;
  let checkUser = await User.findOne({ chat_id }).lean();
  if (!checkUser) await new User({ chat_id, action: "choose_language" }).save();
  else
    await User.findByIdAndUpdate(
      checkUser._id,
      { ...checkUser, action: "choose_language" },
      { new: true }
    );

  await remove_msg(chat_id);

  let message = await bot
    .sendMessage(
      chat_id,
      `Assalom aleykum, ${msg.from.first_name}. Iltimos tilni tanlang.

Здравствуйте, ${msg.from.first_name}. Выберите языка`,
      {
        reply_markup: {
          keyboard: [[{ text: `🇺🇿 O'zbek tili` }, { text: "🇷🇺 Русский язык" }]],
          resize_keyboard: true,
        },
      }
    )
    .catch(() => {
      return false;
    });

  await log_msg(chat_id, message.message_id);
};

const get_language = async (msg) => {
  const chat_id = msg.from.id;
  await remove_msg(chat_id);
  let user = await User.findOne({ chat_id }).lean();
  let message;
  user.language =
    msg.text == "🇷🇺 Русский язык"
      ? "ru"
      : msg.text == "🇺🇿 O'zbek tili"
      ? "uz"
      : null;

  if (!user.language) {
    message = await bot
      .sendMessage(
        chat_id,
        `Assalom aleykum, ${msg.from.first_name}. Iltimos tilni tanlang.
            
Здравствуйте, ${msg.from.first_name}. Выберите языка`,
        {
          reply_markup: {
            keyboard: [
              [{ text: `🇺🇿 O'zbek tili` }, { text: "🇷🇺 Русский язык" }],
            ],
            resize_keyboard: true,
          },
        }
      )
      .catch(() => {
        return false;
      });
  } else {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "welcome" },
      { new: true }
    );
    return await welcome(msg);
  }
  // } else {
  //   if (user.phone_number) {
  //     await User.findByIdAndUpdate(
  //       user._id,
  //       { ...user, action: "welcome" },
  //       { new: true }
  //     );
  //     return await welcome(msg);
  //   }
  //   await User.findByIdAndUpdate(
  //     user._id,
  //     { ...user, action: "get_phone" },
  //     { new: true }
  //   );
  //   message = await bot
  //     .sendMessage(chat_id, lang[user.language].get_phone, {
  //       reply_markup: {
  //         keyboard: [
  //           [
  //             {
  //               text: lang[user.language].phone_btn,
  //               request_contact: true,
  //             },
  //           ],
  //         ],
  //         resize_keyboard: true,
  //       },
  //     })
  //     .catch(() => {
  //       return false;
  //     });
  await log_msg(chat_id, message.message_id);
};

const get_phone = async (msg) => {
  const chat_id = msg.from.id;
  await remove_msg(chat_id);

  let user = await User.findOne({ chat_id }).lean();
  let message;

  user.phone_number = msg.contact?.phone_number || null;

  console.log(user, msg?.contact?.phone_number, "get_phone");

  if (!user.phone_number) {
    message = await bot
      .sendMessage(chat_id, lang[user.language].get_phone, {
        reply_markup: {
          keyboard: [
            [
              {
                text: lang[user.language].phone_btn,
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      })
      .catch(() => {
        return false;
      });
  } else {
    console.log("okkkk")
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "review_6" },
      { new: true }
    );
    await end_review(msg);
  }

  await log_msg(chat_id, message.message_id);
};

module.exports = {
  start,
  choose_language,
  get_language,
  get_phone,
};
