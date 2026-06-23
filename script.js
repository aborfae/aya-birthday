const $ = (s) => document.querySelector(s);

const screens = {
  lock: $("#lockScreen"),
  birthday: $("#birthdayScreen"),
  sad: $("#sadScreen"),
  cat: $("#catScreen"),
  next: $("#nextScreen"),
  hearts: $("#heartsScreen"),
  heartVideo: $("#heartVideoScreen"),
  heartVideo: $("#heartVideoScreen"),
  final: $("#finalQuestionScreen")
};

const birthdayAudio = $("#birthdayAudio");
const sadAudio = $("#sadAudio");
const toast = $("#toast");
const fxRain = $("#fxRain");
const page4BgVideo = $("#page4BgVideo");
const page4VideoToggle = $("#page4VideoToggle");

const eventLog = JSON.parse(localStorage.getItem("aya_site_events") || "[]");

function logEvent(name, details = {}) {
  const item = { name, details, at: new Date().toISOString() };
  eventLog.push(item);
  localStorage.setItem("aya_site_events", JSON.stringify(eventLog));
  console.log("[Aya site event]", item);
}

function showToast(message, timeout = 3000) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), timeout);
}

function showScreen(key) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[key].classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
  logEvent("screen_open", { screen: key });

  if (page4BgVideo) {
    if (key === "next") {
      page4BgVideo.volume = 0.65;
      page4BgVideo.play()
        .then(() => {
          if (page4VideoToggle) page4VideoToggle.textContent = "إيقاف الفيديو ❚❚";
        })
        .catch(() => {
          if (page4VideoToggle) page4VideoToggle.textContent = "تشغيل الفيديو بالصوت ▶";
        });
    } else {
      page4BgVideo.pause();
      if (page4VideoToggle) page4VideoToggle.textContent = "تشغيل الفيديو بالصوت ▶";
    }
  }
}

function rain(type, count = 30) {
  fxRain.innerHTML = "";
  const love = ["💗", "💕", "🌸", "🌹", "💖"];
  const dark = ["🩸", "🔫", "•", "💥", "🩸"];
  const arr = type === "love" ? love : dark;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "rain-item";
    span.textContent = arr[Math.floor(Math.random() * arr.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = (16 + Math.random() * 24) + "px";
    span.style.animationDuration = (2.4 + Math.random() * 2.4) + "s";
    fxRain.appendChild(span);
  }
  setTimeout(() => fxRain.innerHTML = "", 5200);
}

/* PAGE 1 */
const targetDate = new Date("2026-06-21T00:01:00");
function pad(n) { return String(n).padStart(2, "0"); }
function updateCountdown() {
  let diff = Math.max(0, targetDate - new Date());
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);
  $("#days").textContent = String(days).padStart(3, "0");
  $("#hours").textContent = pad(hours);
  $("#minutes").textContent = pad(minutes);
  $("#seconds").textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

let wrongCount = 0;
$("#passwordForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = $("#passwordInput").value.trim().toLowerCase();
  const isCorrectPassword = (answer === "flowers" || answer === "flower");
  logEvent("password_attempt", { answer, correct: isCorrectPassword });

  if (isCorrectPassword) {
    $("#passwordFeedback").textContent = "";
    showScreen("birthday");
    birthdayAudio.currentTime = 0;
    birthdayAudio.play().catch(() => $("#playBirthdayFallback").classList.remove("hidden"));
  } else {
    wrongCount++;
    $("#passwordFeedback").textContent = "Not quite... try again.";
    if (wrongCount >= 3) {
      showToast("Hint: Aya really loves this thing 🌸\nتلميح: الحاجة دي أية بتحبها جدًا", 5000);
    }
  }
});

/* PAGE 2 */
$("#playBirthdayFallback").addEventListener("click", () => birthdayAudio.play());

$("#birthdayToggle").addEventListener("click", () => {
  if (birthdayAudio.paused) {
    birthdayAudio.play();
  } else {
    birthdayAudio.pause();
  }
});
birthdayAudio.addEventListener("play", () => $("#birthdayToggle").textContent = "❚❚");
birthdayAudio.addEventListener("pause", () => $("#birthdayToggle").textContent = "▶");

$("#envelopeBtn").addEventListener("click", () => {
  const envelope = $("#giftEnvelope");
  envelope.classList.add("open");
  logEvent("birthday_envelope_opened");
  showToast("Your message is coming out of the envelope 💌", 2400);

  setTimeout(() => {
    $("#birthdayLetter").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 380);
});

$("#giftCardBtn").addEventListener("click", () => {
  $("#giftReveal").classList.toggle("hidden");
  logEvent("gift_card_clicked");
});

let notReadyClicks = 0;
const notReadyMessages = [
  "متخليش الفرصة تفوتك 😌💗",
  "دي معمولة علشان حد غالي عندي 🌸",
  "خلاص أوكي أوكي... اضغطي تاني 💔"
];

$("#notReadyBtn").addEventListener("click", () => {
  logEvent("not_ready_click", { click: 1 });
  birthdayAudio.pause();
  showScreen("sad");
  startSadPage();
});

$("#yesBtn").addEventListener("click", () => {
  logEvent("birthday_yes_clicked");
  birthdayAudio.pause();
  showScreen("cat");
});

/* PAGE 2B */
const lyrics = [
  { label: "Verse 1", start: 22, end: 42, text: `خيبت توقعاتك
دمرت خلاص حياتك
بتراجع في حساباتك
طيب الله المعين
راجع كل اللي فاتك
الحلو في ذكرياتك
لو عديت إنجازاتك
مين شاركك فيها مين` },
  { label: "Chorus 1", start: 42, end: 66, text: `أنا نور طريقك ياللي كنت
صعب تمشي في الطريق
أنا كنت كل أمل حياتك
وانت بتموت بالبطيء
بقى ده جزاتي في ثانية بعت
ماشي تحكي أنك بريء
وتقول بسببي تعبت ضعت
ونكرت خيري وكل شيء` },
  { label: "Verse 2", start: 66, end: 86, text: `لخبطت أنا ترتيباتك
ضيعت أنا مجهوداتك
حظك سايبك وفاتك
معلش الجاي خير
هتلاقي حد تاني
يملى فراغي ومكاني
وبكره الله يعوض
ربك دايما كبير` },
  { label: "Chorus 2", start: 86, end: 110, text: `أنا نور طريقك ياللي كنت
صعب تمشي في الطريق
أنا كنت كل أمل حياتك
وانت بتموت بالبطيء
بقى ده جزاتي في ثانية بعت
ماشي تحكي أنك بريء
وتقول بسببي تعبت ضعت
ونكرت خيري وكل شيء` },
  { label: "Ending", start: 110, end: 130, text: `أنا كنت كل أمل حياتك
وانت بتموت بالبطيء
بقى ده جزاتي في ثانية بعت
ماشي تحكي أنك بريء
وتقول بسببي تعبت ضعت` }
];

$("#lyricsGroups").innerHTML = lyrics.map((g, i) => `
  <div class="lyric-group" data-i="${i}">
    <span class="group-tag">${g.label}</span>
    <p>${g.text.replace(/\n/g, "<br>")}</p>
  </div>
`).join("");

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function startSadPage() {
  sadAudio.currentTime = 22;
  $("#sadCurrent").textContent = "00:22";
  sadAudio.play()
    .then(() => $("#sadToggle").textContent = "Pause 💔")
    .catch(() => $("#sadToggle").textContent = "Play the sad song 💔");
}

$("#sadToggle").addEventListener("click", () => {
  if (sadAudio.paused) {
    if (sadAudio.currentTime < 22) sadAudio.currentTime = 22;
    sadAudio.play();
  } else {
    sadAudio.pause();
  }
});
sadAudio.addEventListener("loadedmetadata", () => {
  $("#sadProgress").max = sadAudio.duration;
  $("#sadDuration").textContent = fmt(sadAudio.duration);
});
sadAudio.addEventListener("play", () => $("#sadToggle").textContent = "Pause 💔");
sadAudio.addEventListener("pause", () => $("#sadToggle").textContent = "Play the sad song 💔");
sadAudio.addEventListener("timeupdate", () => {
  const t = Math.max(22, sadAudio.currentTime);
  $("#sadProgress").value = t;
  $("#sadCurrent").textContent = fmt(t);

  let active = 0;
  lyrics.forEach((g, i) => { if (t >= g.start && t < g.end) active = i; });
  document.querySelectorAll(".lyric-group").forEach((el, i) => el.classList.toggle("active", i === active));
});
$("#sadProgress").addEventListener("input", (e) => sadAudio.currentTime = Number(e.target.value));
$("#backToBirthday").addEventListener("click", () => {
  sadAudio.pause();
  showScreen("birthday");
});

/* PAGE 3 */
const catYes = $("#catYes");
const catNo = $("#catNo");
const speech = $("#speechBubble");
const gun = $("#gunWrap");
const rose = $("#roseBadge");
const cat = $("#cat");
let noLeft = 5;
let yesClicks = 0;
let noClicks = 0;

function addBulletHole() {
  const hole = document.createElement("span");
  hole.className = "bullet-hole";
  hole.style.left = (14 + Math.random() * 70) + "%";
  hole.style.top = (16 + Math.random() * 58) + "%";
  catNo.appendChild(hole);
}

catYes.addEventListener("click", () => {
  logEvent("cat_yes_clicked", { noLeft, noClicks });
  rain("love", 36);
  rose.style.opacity = "1";
  yesClicks++;

  // New rule:
  // Yes can continue after only one No click.
  // Before pressing No at least once, it stays playful and asks Aya to try No.
  if (noClicks >= 1) {
    showScreen("next");
    return;
  }

  const prompts = [
    "Oops... good, you didn’t choose no 🌹",
    "Try No just once first 😼",
    "One No only... then Yes will work 💗"
  ];
  speech.textContent = prompts[Math.min(yesClicks - 1, prompts.length - 1)];
  $("#playHint").textContent = "Press No one time, then Yes will continue.";
});

catNo.addEventListener("click", () => {
  if (noLeft <= 0) {
    speech.textContent = "I love Aya, I wanna play with her 🌹";
    return;
  }

  noLeft--;
  noClicks++;
  logEvent("cat_no_clicked", { noLeft });

  rain("dark", 24);
  gun.classList.remove("hidden");
  rose.style.opacity = "0";
  cat.classList.add("no-mode", "level" + Math.min(noClicks, 5));
  addBulletHole();

  const messages = [
    "You don’t wanna play?",
    "Why do you keep saying no?",
    "Still no?",
    "I’m pointing at your screen now...",
    "I love Aya, I wanna play with her 🌹"
  ];
  speech.textContent = messages[Math.min(noClicks - 1, messages.length - 1)];
  $("#noCounter").textContent = "No counter: " + noLeft;
  $("#playHint").textContent = "No keeps getting louder...";
  gun.style.transform = `rotate(${-10 - noClicks * 4}deg) translateX(${-noClicks * 8}px)`;

  if (noLeft === 0) {
    catNo.disabled = true;
    catNo.textContent = "No stopped";
    catNo.style.opacity = "0.72";
    catNo.style.cursor = "not-allowed";
    catNo.style.boxShadow = "0 0 0 3px rgba(255,255,255,.18), 0 0 24px rgba(255,72,120,.42)";
    speech.textContent = "I love Aya, I wanna play with her 🌹";
    setTimeout(() => {
      gun.classList.add("hidden");
      rose.style.opacity = "1";
      cat.className = "cat-character";
      $("#playHint").textContent = "No stopped after 5 times. Press Yes now.";
    }, 800);
  }
});


const bigGift = $("#bigGift");
const giftCards = $("#giftCards");

function openPage4Gift() {
  bigGift.classList.add("open");
  logEvent("page4_gift_opened");
  rain("love", 28);
  setTimeout(() => {
    giftCards.classList.add("show");
    giftCards.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 520);
}

bigGift.addEventListener("click", openPage4Gift);
bigGift.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openPage4Gift();
  }
});

$("#page4NextBtn").addEventListener("click", () => {
  logEvent("page4_next_clicked");
  showScreen("hearts");
  setTimeout(() => {
    document.querySelectorAll("#heartsScreen video").forEach(v => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, 200);
});

$("#backToCat").addEventListener("click", () => showScreen("cat"));


if (page4VideoToggle && page4BgVideo) {
  page4VideoToggle.addEventListener("click", () => {
    page4BgVideo.volume = 0.65;
    if (page4BgVideo.paused) {
      page4BgVideo.play().then(() => {
        page4VideoToggle.textContent = "إيقاف الفيديو ❚❚";
      }).catch(() => {
        showToast("المتصفح منع التشغيل التلقائي، اضغط مرة كمان", 2200);
      });
    } else {
      page4BgVideo.pause();
      page4VideoToggle.textContent = "تشغيل الفيديو بالصوت ▶";
    }
  });
}


document.querySelectorAll(".magic-heart").forEach(btn => {
  btn.addEventListener("click", () => {
    const heartNumber = btn.dataset.heart;
    logEvent("page5_heart_clicked", { heart: heartNumber });
    showToast(`Heart ${heartNumber}: هنا بعدين هنفتح الفيديو الخاص بالقلب ده 💗`, 2600);
    rain("love", 24);
  });
});

const backToPage4 = $("#backToPage4");
if (backToPage4) {
  backToPage4.addEventListener("click", () => showScreen("next"));
}

const page5Continue = $("#page5Continue");
if (page5Continue) {
  page5Continue.addEventListener("click", () => {
    showToast("لسه هنكمل اللي بعد صفحة القلوب 💗", 2400);
  });
}











/* ===== V10: EACH HEART OPENS ITS OWN VIDEO PAGE ===== */
const v10HeartVideoMap = {
  "1": "assets/page5_heart_videos/heart_1_light.mp4",
  "2": "assets/page5_heart_videos/heart_2_light.mp4",
  "3": "assets/page5_heart_videos/heart_3_light.mp4",
  "4": "assets/page5_heart_videos/heart_4_light.mp4"
};

const singleHeartVideo = $("#singleHeartVideo");
const singleHeartPlay = $("#singleHeartPlay");
const heartVideoPageTitle = $("#heartVideoPageTitle");
const backFromHeartVideo = $("#backFromHeartVideo");

function openSingleHeartVideo(n) {
  if (!singleHeartVideo || !v10HeartVideoMap[n]) return;
  heartVideoPageTitle.textContent = `Heart ${n}`;
  singleHeartVideo.pause();
  singleHeartVideo.src = v10HeartVideoMap[n];
  singleHeartVideo.load();
  showScreen("heartVideo");

  singleHeartVideo.onloadedmetadata = () => {
    singleHeartVideo.currentTime = 0;
    if (singleHeartPlay) singleHeartPlay.textContent = "تشغيل الفيديو ▶";
  };

  if (typeof logEvent === "function") logEvent("heart_video_page_opened", { heart: n });
}

document.addEventListener("click", function(e) {
  const heart = e.target.closest(".magic-heart");
  if (!heart) return;

  const heartsScreen = document.querySelector("#heartsScreen");
  if (!heartsScreen || !heartsScreen.classList.contains("active")) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const n = heart.dataset.heart;
  if (v10HeartVideoMap[n]) {
    openSingleHeartVideo(n);
    return;
  }

  if (n === "5") {
    showScreen("final");
    if (typeof rain === "function") rain("love", 42);
  }
}, true);

if (singleHeartPlay && singleHeartVideo) {
  singleHeartPlay.addEventListener("click", () => {
    singleHeartVideo.play().catch(() => {});
  });
}

if (backFromHeartVideo) {
  backFromHeartVideo.addEventListener("click", () => {
    if (singleHeartVideo) {
      singleHeartVideo.pause();
      singleHeartVideo.removeAttribute("src");
      singleHeartVideo.load();
    }
    showScreen("hearts");
  });
}

const page5ContinueV10 = $("#page5Continue");
if (page5ContinueV10) {
  page5ContinueV10.addEventListener("click", () => showScreen("final"));
}

const backToHeartsV10 = $("#backToHearts");
if (backToHeartsV10) {
  backToHeartsV10.addEventListener("click", () => showScreen("hearts"));
}

const surpriseMeterV10 = $("#surpriseMeter");
const meterValueV10 = $("#meterValue");
if (surpriseMeterV10 && meterValueV10) {
  surpriseMeterV10.addEventListener("input", () => {
    meterValueV10.textContent = `${surpriseMeterV10.value} / 10`;
  });
}

function acceptFinalSurpriseV10(type) {
  if (typeof logEvent === "function") logEvent("final_question_accepted", { type });
  if (surpriseMeterV10) surpriseMeterV10.value = 10;
  if (meterValueV10) meterValueV10.textContent = "10 / 10";
  const msg = $("#finalMessage");
  if (msg) msg.classList.remove("hidden");
  if (typeof rain === "function") rain("love", 80);
  if (typeof showToast === "function") showToast("She accepted the surprise 💗🌸", 3000);
}

const finalYesV10 = $("#finalYes");
const finalOfCourseV10 = $("#finalOfCourse");
if (finalYesV10) finalYesV10.addEventListener("click", () => acceptFinalSurpriseV10("yes"));
if (finalOfCourseV10) finalOfCourseV10.addEventListener("click", () => acceptFinalSurpriseV10("of_course_yes"));


/* ===== V11 NETLIFY OPTIMIZED BACKGROUND STRIPS ===== */
const page5BgVideoSources = [
  "assets/page5_bg_videos/bg_01.mp4",
  "assets/page5_bg_videos/bg_02.mp4",
  "assets/page5_bg_videos/bg_03.mp4",
  "assets/page5_bg_videos/bg_04.mp4",
  "assets/page5_bg_videos/bg_05.mp4",
  "assets/page5_bg_videos/bg_06.mp4",
  "assets/page5_bg_videos/bg_07.mp4",
  "assets/page5_bg_videos/bg_08.mp4",
  "assets/page5_bg_videos/bg_09.mp4",
  "assets/page5_bg_videos/bg_10.mp4",
  "assets/page5_bg_videos/bg_11.mp4",
  "assets/page5_bg_videos/bg_12.mp4",
  "assets/page5_bg_videos/bg_13.mp4",
  "assets/page5_bg_videos/bg_14.mp4",
  "assets/page5_bg_videos/bg_15.mp4",
  "assets/page5_bg_videos/bg_16.mp4",
  "assets/page5_bg_videos/bg_17.mp4",
  "assets/page5_bg_videos/bg_18.mp4"
];

let page5BgOffset = 0;
let page5BgTimer = null;

function setPage5BgSources() {
  const vids = Array.from(document.querySelectorAll(".opt-strip-video"));
  vids.forEach((video, index) => {
    const src = page5BgVideoSources[(page5BgOffset + index) % page5BgVideoSources.length];
    if (!video.src.includes(src)) {
      video.src = src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.load();
    }
    video.play().catch(() => {});
  });
}

function startPage5Bg() {
  if (!page5BgVideoSources.length) return;
  setPage5BgSources();
  clearInterval(page5BgTimer);
  page5BgTimer = setInterval(() => {
    page5BgOffset = (page5BgOffset + 4) % page5BgVideoSources.length;
    setPage5BgSources();
  }, 7200);
}

function stopPage5Bg() {
  clearInterval(page5BgTimer);
  page5BgTimer = null;
  document.querySelectorAll(".opt-strip-video").forEach(video => video.pause());
}

// Patch showScreen lightly without breaking old behavior
const originalShowScreenV11 = showScreen;
showScreen = function(key) {
  originalShowScreenV11(key);
  if (key === "hearts") startPage5Bg();
  else stopPage5Bg();

  // Pause heart page video when leaving its page
  if (key !== "heartVideo" && typeof singleHeartVideo !== "undefined" && singleHeartVideo) {
    singleHeartVideo.pause();
  }
};
