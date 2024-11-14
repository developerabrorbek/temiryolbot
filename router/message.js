const { bot } = require("../bot");
const User = require("../model/user");

const lang = require("../helper/lang");
const { getKey } = require("../helper/func");

const {
  start,
  choose_language,
  get_language,
  get_phone,
} = require("../controller/message/start");
const { welcome } = require("../controller/message/welcome");

const { about } = require("../controller/message/about");
const {
  start_review,
  start_text,
  start_ticket,
  get_review,
  end_review,
} = require("../controller/message/review");
const { remove_msg, log_msg } = require("../helper/msg");
const ReviewType = require("../model/review-type");
const Review = require("../model/review");

const user_action = {
  "/start": start,
  choose_language: get_language,
  welcome: welcome,
  review_1: start_text,
  review_2: start_ticket,
  review_5: get_review,
  // review_6: end_review,
};

const url_map = {
  about_us: about,
  set_language: choose_language,
  start_review: start_review,
};

bot.on("message", async (msg) => {
  const chat_id = msg.from.id;
  let user = (await User.findOne({ chat_id }).lean()) || null;

  if (msg.text == "/start") {
    return await start(msg);
  }

  if (!user || (!user.language && user?.action !== "choose_language")) {
    return await choose_language(msg);
  }

  if (user && user?.action == "choose_language") {
    return await get_language(msg);
  }

  // if (!user.phone_number || user.action == "get_phone") {
  //   return await get_phone(msg);
  // }

  if (url_map.hasOwnProperty(getKey(lang[user.language], msg.text))) {
    return await url_map[getKey(lang[user.language], msg.text)](
      msg,
      user.language
    );
  }

  if (user_action.hasOwnProperty(user.action)) {
    return await user_action[user.action](msg);
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chat_id = message.chat.id;

  let user = await User.findOne({ chat_id }).lean();

  await remove_msg(chat_id);

  if (data == "review_2") {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "review_2" },
      { new: true }
    );
    await log_msg(chat_id, message.from.id);
    return await start_ticket(message);
  }

  if (data == "review_3") {
    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "review_3" },
      { new: true }
    );

    const reviewTypes = await ReviewType.find({
      sub_reviews: {
        $not: {
          $size: 0,
        },
      },
    }).populate("sub_reviews");

    const reviewTypeBtns = [];
    for (let i = 0; i < reviewTypes.length; i += 2) {
      const keyboardArr = [];
      keyboardArr.push({
        text: reviewTypes[i].name[user.language],
        callback_data: `review_type-${reviewTypes[i].id}`,
      });
      if (i + 1 < reviewTypes.length) {
        keyboardArr.push({
          text: reviewTypes[i + 1].name[user.language],
          callback_data: `review_type-${reviewTypes[i + 1].id}`,
        });
      }
      reviewTypeBtns.push(keyboardArr);
    }

    let msg = await bot.sendMessage(chat_id, lang[user.language].review_3, {
      reply_markup: {
        inline_keyboard: [
          ...reviewTypeBtns,
          [{ text: lang[user.language].back, callback_data: "review_2" }],
        ],
        resize_keyboard: true,
      },
    });
    return await log_msg(chat_id, msg.message_id);
  }

  if (data.startsWith("review_type")) {
    const reviewId = data.split("-")[1];

    const reviewType = await ReviewType.findById(reviewId).populate(
      "sub_reviews"
    );

    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "review_3_5" },
      { new: true }
    );

    const foundedReviewType = await ReviewType.findOne({
      _id: reviewId,
    }).populate("sub_reviews");

    await Review.updateOne(
      { user: user._id, status: 0 },
      { parent_review_type: reviewId }
    );

    const reviewTypeBtns = [];
    for (let i = 0; i < foundedReviewType.sub_reviews.length; i += 2) {
      const keyboardArr = [];
      keyboardArr.push({
        text: foundedReviewType.sub_reviews[i].name[user.language],
        callback_data: `sub_review_type-${foundedReviewType.sub_reviews[i].id}`,
      });
      if (i + 1 < foundedReviewType.sub_reviews.length) {
        keyboardArr.push({
          text: foundedReviewType.sub_reviews[i + 1].name[user.language],
          callback_data: `sub_review_type-${
            foundedReviewType.sub_reviews[i + 1].id
          }`,
        });
      }
      reviewTypeBtns.push(keyboardArr);
    }

    const msg = await bot.sendMessage(
      chat_id,
      lang[user.language].review_3_5 + reviewType.name[user.language],
      {
        reply_markup: {
          inline_keyboard: [
            ...reviewTypeBtns,
            [{ text: lang[user.language].back, callback_data: "review_3" }],
          ],
        },
      }
    );

    await log_msg(chat_id, msg.message_id);
    return;
  }

  if (data.startsWith("sub_review_type")) {
    const foundedReview = await Review.findOne({ user: user._id, status: 0 });
    const subReviewTypeId = data.split("-")[1] || foundedReview.review_type;
    const subReviewType = await ReviewType.findById(subReviewTypeId);

    const subReview = await Review.updateOne(
      { user: user._id, status: 0 },
      { review_type: subReviewType._id }
    );

    const categoryBtns = [];

    Object.keys(lang[user.language].category).forEach((key) => {
      categoryBtns.push([
        {
          text: lang[user.language].category[key],
          callback_data: `category_${key}`,
        },
      ]);
    });

    const msg = await bot.sendMessage(
      chat_id,
      lang[user.language].review_3_5 + subReviewType.name[user.language],
      {
        reply_markup: {
          inline_keyboard: [
            ...categoryBtns,
            [
              {
                text: lang[user.language].back,
                callback_data: `review_type-${foundedReview.parent_review_type}`,
              },
            ],
          ],
        },
      }
    );
    await log_msg(chat_id, msg.message_id);
    return;
  }

  if (data.startsWith("category") || data == "review_4") {
    const category = data.split("_")[1];
    await Review.findOne({ user: user._id, status: 0 });

    await Review.updateOne({ user: user._id, status: 0 }, { category });

    await User.findByIdAndUpdate(
      user._id,
      { ...user, action: "review_5" },
      { new: true }
    );

    const msg = await bot.sendMessage(chat_id, lang[user.language].review_4);
    await log_msg(chat_id, msg.message_id);
  }
});

bot.on("contact", async (msg) => {
  const chat_id = msg.chat.id;
  const phone = msg.contact.phone_number;
  await remove_msg(chat_id);

  let user = await User.findOne({ chat_id }).lean();

  await User.updateOne(
    { chat_id },
    { phone_number: phone, action: "/start" },
    { new: true }
  );

  const message = await bot.sendMessage(chat_id, lang[user.language].review_6, {
    reply_markup: {
      keyboard: [
        [
          { text: lang[user.language].start_review },
          { text: lang[user.language].about_us },
        ],
        [{ text: lang[user.language].set_language }],
      ],
      resize_keyboard: true,
    },
  });

  await log_msg(chat_id, message.message_id);
});
