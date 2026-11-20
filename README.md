# 🌟 Nova Earning Bot & Telegram Mini App

সম্পূর্ণ রেডি-টু-ইউজ টেলিগ্রাম আর্নিং বট এবং টেলিগ্রাম মিনি অ্যাপ (TMA)। ইউজাররা অ্যাড দেখে এবং টেলিগ্রাম টাস্ক পূরণ করে **NOVA ($NOVA)** কয়েন আয় করতে পারবে, কয়েন এক্সচেঞ্জ করে **USDT** তে কনভার্ট করতে পারবে এবং **USDT (BEP-20 / BNB Smart Chain)** অ্যাড্রেসে উইথড্র নিতে পারবে।

---

## ✨ ফিচারসমূহ (Key Features)

1. **টোকেন/কয়েনের নাম (Coin Name):** **`NOVA` ($NOVA)** — আধুনিক এবং আকর্ষণীয় ক্রিপ্টো আর্নিং কয়েন।
2. **অ্যাড দেখে ইনকাম (Watch Ads):** প্রতি অ্যাড দেখলে ইনস্ট্যান্ট **10 NOVA কয়েন** যোগ হয় (১৫ সেকেন্ড কাউন্টডাউন ও রিওয়ার্ড মোডাল সহ)।
3. **টেলিগ্রাম টাস্ক (Telegram Tasks):**
   - 📢 **Official Channel Join:** +50 NOVA
   - ⭐ **Promoter Partner Channel Join:** +75 NOVA
   - 👥 **Community Discussion Group:** +40 NOVA
   - 🎁 **Daily Check-in Bonus:** +25 NOVA প্রতিদিন
4. **টোকেন এক্সচেঞ্জ (Swap to USDT):** 
   - রেট: `1000 NOVA = 1.00 USDT` (১টি NOVA = 0.001 USDT)
   - 25%, 50%, 75%, 100% MAX বাটন ও লাইভ ক্যালকুলেটর।
5. **USDT BEP-20 উইথড্রয়াল (Withdrawal):**
   - নেটওয়ার্ক: **BNB Smart Chain (BEP-20)**
   - মিনিমাম উইথড্র: `1.00 USDT`
   - ভ্যালিডেশন: `0x...` ৪২ অক্ষরের BEP-20 অ্যাড্রেস চেক
   - উইথড্রয়াল হিস্টোরি (Pending, Approved, Completed স্ট্যাটাস)।
6. **প্রিমিয়াম ইউআই ডিজাইন (Modern Minimalist UI):**
   - অতিরিক্ত গ্লো (Glow effect) এড়িয়ে ক্লিন ও প্রফেশনাল ফিনটেক ডার্ক-মোড লুক।
   - উপরে আলাদা কালার ও গ্রেডিয়েন্টে ব্যালেন্স বক্স (NOVA কয়েন এবং ইকুইভ্যালেন্ট USDT ব্যালেন্স সহ)।
   - নিচে আলাদা কার্ড ডিজাইনে টাস্ক, অ্যাড ও ক্যাশআউট সেকশন।
   - ৫টি ডেডিকেটেড পেজ/ট্যাব: **Home, Watch Ads, Tasks, Swap, Wallet (Withdraw & History)**।

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```
d:/progact/
├── backend/
│   ├── src/
│   │   ├── config.js         # কয়েনের নাম, রেট, চ্যানেল লিঙ্ক, মিনিমাম উইথড্র ইত্যাদি
│   │   ├── db.js             # ডাটাবেস হ্যান্ডলার (ইউজার, ব্যালেন্স, উইথড্রয়াল)
│   │   ├── bot.js            # টেলিগ্রাম বট (/start, /balance, /help, Mini App বাটন)
│   │   └── server.js         # এক্সপ্রেস রেস্ট এপিআই (Express REST API)
│   ├── .env                  # টেলিগ্রাম বট টোকেন ও কনফিগারেশন
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── context/AppContext.jsx   # স্টেট ও এপিআই সিঙ্ক
│   │   ├── components/
│   │   │   ├── Header.jsx           # ইউজার প্রোফাইল ও নেটওয়ার্ক ব্যাজ
│   │   │   ├── TopBalanceCard.jsx   # উপরের আলাদা কালারের ব্যালেন্স বক্স
│   │   │   ├── BottomNav.jsx        # নিচের ট্যাব নেভিগেশন
│   │   │   ├── AdPlayerModal.jsx    # অ্যাড প্লেয়ার ও কাউন্টডাউন মোডাল
│   │   │   └── Toast.jsx            # নোটিফিকেশন টোস্ট
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # আকর্ষণীয় হোম পেজ
│   │   │   ├── AdsPage.jsx          # প্রতি অ্যাডে ১০ কয়েন আয় পেজ
│   │   │   ├── TasksPage.jsx        # অফিসিয়াল ও প্রোমোটার টাস্ক পেজ
│   │   │   ├── ExchangePage.jsx     # NOVA থেকে USDT সোয়াপ পেজ
│   │   │   └── WithdrawPage.jsx     # BEP-20 উইথড্রয়াল ও হিস্টোরি পেজ
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
└── package.json
```

---

## 🚀 যেভাবে চালু করবেন (How to Run)

### ধাপ ১: টেলিগ্রাম বট তৈরি ও টোকেন সেটআপ
1. টেলিগ্রামে গিয়ে **@BotFather** সার্চ করুন এবং `/newbot` লিখে একটি নতুন বট তৈরি করুন।
2. BotFather আপনাকে একটি **API Token** দেবে (যেমন: `123456789:ABCdefGhI...`)।
3. `backend/.env` ফাইলটি খুলুন এবং আপনার টোকেন ও চ্যানেল লিঙ্ক বসিয়ে দিন:
   ```env
   PORT=5000
   BOT_TOKEN=আপনার_বট_টোকেন_এখানে_দিন
   WEBAPP_URL=http://localhost:5173
   OFFICIAL_CHANNEL=https://t.me/আপনার_অফিসিয়াল_চ্যানেল
   PROMOTER_CHANNEL=https://t.me/আপনার_প্রোমোটার_চ্যানেল
   ```

### ধাপ ২: ব্যাকএন্ড সার্ভার চালু করা
টার্মিনালে লিখুন:
```powershell
cd d:\progact\backend
node src/server.js
```
সার্ভার চালু হলে দেখাবে:
`🚀 Nova API Server running on port 5000`
`🤖 Telegram Bot started successfully!`

### ধাপ ৩: ফ্রন্টএন্ড (Mini App) চালু করা
নতুন আরেকটি টার্মিনালে লিখুন:
```powershell
cd d:\progact\frontend
npm.cmd run dev
```
এরপর ব্রাউজারে `http://localhost:5173` ওপেন করলেই সম্পূর্ণ অ্যাপটি দেখতে ও পরীক্ষা করতে পারবেন!

---

## 📱 টেলিগ্রামের ভেতরে মিনি অ্যাপ (Mini App) হিসেবে সেটআপ

1. যখন আপনি ফ্রন্টএন্ড লাইভ ডিপ্লয় করবেন (যেমন Vercel / Netlify / Render বা ngrok দিয়ে), তখন পাওয়া লিঙ্কটি হবে আপনার WebApp URL।
2. টেলিগ্রামে **@BotFather** এ যান:
   - লিখুন: `/newapp`
   - আপনার বট সিলেক্ট করুন।
   - অ্যাপের নাম ও ডেসক্রিপশন দিন।
   - একটি ছবি দিন (640x360 px)।
   - **Web App URL** চাইবে, সেখানে আপনার ডিপ্লয় করা URL (যেমন `https://your-app.vercel.app`) দিয়ে দিন।
   - একটি শর্ট নেম দিন (যেমন `nova_earn`)।
3. এখন যেকেউ টেলিগ্রামে বটের চ্যাটে গিয়ে `/start` দিলেই **"🚀 Launch Nova Mini App"** বাটনে ক্লিক করে সরাসরি টেলিগ্রামের ভেতরে প্রিমিয়াম অ্যাপটি ব্যবহার করতে পারবে!

