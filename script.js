const clock = document.getElementById("clock");
const format = document.getElementById("format");
const city = document.getElementById("city");
const cityTitle = document.getElementById("cityTitle");
const dateText = document.getElementById("dateText");
const zikr = document.getElementById("zikr");
const reminder = document.getElementById("reminder");
const prayerStatus = document.getElementById("prayerStatus");
const settingsPanel = document.getElementById("settingsPanel");

const prayerNames = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha"
];

// ناوی فایلی داتای هەر شارێک
const cityFiles = {
  Slemany: "Slemany",
  Hawler: "Hawler",
  Duhok: "Duhok",
  Kirkuk: "Kirkuk",
  Halabja: "Halabja",
  Ranya: "Ranya",
  Qaladze: "Qaladze",
  Dukan: "Dukan",
  Penjuin: "Penjuin",
  Darbandixan: "Darbandixan",
  Koya: "Koya",
  Soran: "Soran",
  Chamchamal: "Chamchamal",
  SaidSadiq: "SaidSadiq",
  Arbat: "Arbat",
  Bazyan: "Bazyan",
  TaqTaq: "TaqTaq",
  HajiAwa: "HajiAwa",
  Chwarta: "Chwarta",
  Qaradax: "Qaradax",
  Kalar: "Kalar",
  Kfri: "Kfri",
  Xanaqin: "Xanaqin",
  Barznja: "Barznja"
};

// کۆگای داتاکانی شارەکان
const cityCache = {};

let currentPrayerTimes = {};
let requestNumber = 0;

// ژمارەی کوردی
function toKurdishNumbers(value) {
  return String(value).replace(/[0-9]/g, digit =>
    "٠١٢٣٤٥٦٧٨٩"[Number(digit)]
  );
}

// بەرواری عێراق
function getBaghdadDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const result = {};

  parts.forEach(part => {
    if (part.type !== "literal") {
      result[part.type] = Number(part.value);
    }
  });

  return result;
}

// کاتژمێر
function updateClock() {
  clock.textContent = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Baghdad",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: format.value === "12"
  });
}

// ساڵنامەی کوردی
function getKurdishDate() {
  const parts = getBaghdadDateParts();

  const year = parts.year;
  const month = parts.month;
  const day = parts.day;

  const currentDate = Date.UTC(year, month - 1, day);

  let startYear = year;

  if (currentDate < Date.UTC(year, 2, 21)) {
    startYear--;
  }

  const startDate = Date.UTC(startYear, 2, 21);
  const nextStartDate = Date.UTC(startYear + 1, 2, 21);

  let dayNumber = Math.floor(
    (currentDate - startDate) / 86400000
  );

  const yearLength = Math.round(
    (nextStartDate - startDate) / 86400000
  );

  const months = [
    "نەورۆز",
    "گوڵان",
    "جۆزەردان",
    "پووشپەڕ",
    "گەلاوێژ",
    "خەرمانان",
    "ڕەزبەر",
    "گەڵاڕێزان",
    "سەرماوەز",
    "بەفرانبار",
    "ڕێبەندان",
    "ڕەشەمە"
  ];

  const lengths = [
    31, 31, 31, 31, 31, 31,
    30, 30, 30, 30, 30,
    yearLength - 336
  ];

  let monthIndex = 0;

  while (
    monthIndex < 11 &&
    dayNumber >= lengths[monthIndex]
  ) {
    dayNumber -= lengths[monthIndex];
    monthIndex++;
  }

  return (
    toKurdishNumbers(dayNumber + 1) +
    "ی " +
    months[monthIndex] +
    " " +
    toKurdishNumbers(startYear + 700)
  );
}

// بەرواری زایینی
function getGregorianDate() {
  return new Intl.DateTimeFormat("ar-IQ", {
    timeZone: "Asia/Baghdad",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

// بەرواری کۆچی
function getHijriDate() {
  return new Intl.DateTimeFormat("ar-IQ-u-ca-islamic", {
    timeZone: "Asia/Baghdad",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

// گۆڕینی بەروارەکان
const dates = [
  getKurdishDate,
  getGregorianDate,
  getHijriDate
];

let dateIndex = 0;

function updateDate() {
  dateText.style.opacity = 0;

  setTimeout(() => {
    dateText.textContent = dates[dateIndex]();
    dateText.style.opacity = 1;

    dateIndex = (dateIndex + 1) % dates.length;
  }, 300);
}

// زیکرەکان
const azkar = [
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
  "لَا إِلَهَ إِلَّا اللَّهُ",
  "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
];

let zikrIndex = 0;

function updateZikr() {
  zikr.style.opacity = 0;
  zikr.style.transform = "translateY(8px)";

  setTimeout(() => {
    zikrIndex = (zikrIndex + 1) % azkar.length;
    zikr.textContent = azkar[zikrIndex];

    zikr.style.opacity = 1;
    zikr.style.transform = "translateY(0)";
  }, 500);
}

// گۆڕینی کاتی 12 بۆ 24 کاتژمێر
function convertTo24Hour(value, prayerName) {
  if (!value) return "";

  const parts = value.split(":");
  let hour = Number(parts[0]);
  const minute = Number(parts[1]);

  // ئەم کاتانە لە داتاکەدا بە شێوازی 12 کاتژمێرن
  if (
    ["asr", "maghrib", "isha"].includes(prayerName) &&
    hour < 12
  ) {
    hour += 12;
  }

  return (
    String(hour).padStart(2, "0") +
    ":" +
    String(minute).padStart(2, "0")
  );
}

// نیشاندانی کات بە شێوازی 12 یان 24
function displayTime(value) {
  if (!value) return "--:--";

  if (format.value === "24") {
    return value;
  }

  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "م" : "ص";
  const shownHour = hour % 12 || 12;

  return (
    String(shownHour).padStart(2, "0") +
    ":" +
    String(minute).padStart(2, "0") +
    " " +
    suffix
  );
}

// پیشاندانی کاتەکانی نوێژ
function renderPrayerTimes() {
  prayerNames.forEach(name => {
    const value = currentPrayerTimes[name] || "";

    document.getElementById("show-" + name).textContent =
      displayTime(value);

    const input = document.getElementById("time-" + name);

    if (input) {
      input.value = value;
    }
  });
}

// کلیلی پاشەکەوتی دەستکارییەکان
function getOverrideKey() {
  return "manualPrayerTimes_" + city.value;
}

// خوێندنەوەی دەستکارییەکانی بەکارهێنەر
function loadManualOverrides() {
  const saved = localStorage.getItem(getOverrideKey());

  if (!saved) return;

  try {
    const overrides = JSON.parse(saved);

    prayerNames.forEach(name => {
      if (overrides[name]) {
        currentPrayerTimes[name] = overrides[name];
      }
    });
  } catch (error) {
    console.log("هەڵە لە خوێندنەوەی دەستکارییەکان");
  }
}

// وەرگرتنی داتای شار
async function loadCityPrayerTimes() {
  const thisRequest = ++requestNumber;
  const cityKey = city.value;
  const fileName = cityFiles[cityKey];

  prayerStatus.textContent = "چاوەڕوانی داتای کاتەکانی نوێژ...";

  prayerNames.forEach(name => {
    document.getElementById("show-" + name).textContent = "--:--";
  });

  try {
    if (!fileName) {
      throw new Error("ناوی فایل نییە");
    }

    let data = cityCache[cityKey];

    // ئەگەر داتاکە پێشتر هاتبێت، لە کۆگاکەوە وەریدەگرین
    if (!data) {
      const url =
        "https://raw.githubusercontent.com/Bang-Kurdistan/bang-kurdistan.github.io/main/data/" +
        fileName +
        ".json";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("نەتوانرا داتاکە وەربگیرێت");
      }

      data = await response.json();
      cityCache[cityKey] = data;
    }

    // ئەگەر لە ماوەی وەرگرتنی داتا شارەکە گۆڕابێت
    if (thisRequest !== requestNumber) return;

    const parts = getBaghdadDateParts();

    const todayKey =
      String(parts.month).padStart(2, "0") +
      "-" +
      String(parts.day).padStart(2, "0");

    const todayRow = data.find(row => row.Date === todayKey);

    if (!todayRow) {
      throw new Error("داتای ئەم بەروارە نەدۆزرایەوە");
    }

    currentPrayerTimes = {
      fajr: convertTo24Hour(todayRow.Fajr, "fajr"),
      sunrise: convertTo24Hour(todayRow.Sunrise, "sunrise"),
      dhuhr: convertTo24Hour(todayRow.Dhuhr, "dhuhr"),
      asr: convertTo24Hour(todayRow.Asr, "asr"),
      maghrib: convertTo24Hour(todayRow.Maghrib, "maghrib"),
      isha: convertTo24Hour(todayRow.Isha, "isha")
    };

    // دەستکارییە پاشەکەوتکراوەکان لەسەر داتای سەرەکی جێبەجێ دەکرێن
    loadManualOverrides();

    renderPrayerTimes();

    prayerStatus.textContent =
      "داتای " +
      cityTitle.textContent +
      " — خشتەی ڕۆژانەی سەرچاوەی بانگ";

  } catch (error) {
    if (thisRequest !== requestNumber) return;

    prayerStatus.textContent =
      "نەتوانرا کاتەکان باربکرێن. ئینتەرنێت بپشکنە و دووبارە هەوڵ بدەرەوە.";

    console.error(error);
  }
}

// پاشەکەوتکردنی ڕێکخستنەکان
function savePreferences() {
  localStorage.setItem(
    "prayerPreferences",
    JSON.stringify({
      city: city.value,
      format: format.value
    })
  );
}

function loadPreferences() {
  const saved = localStorage.getItem("prayerPreferences");

  if (saved) {
    try {
      const data = JSON.parse(saved);

      if (data.city && cityFiles[data.city]) {
        city.value = data.city;
      }

      if (data.format) {
        format.value = data.format;
      }
    } catch (error) {
      console.log("هەڵە لە ڕێکخستنەکان");
    }
  }

  cityTitle.textContent =
    city.options[city.selectedIndex].textContent;
}

// کردنەوەی ڕێکخستنەکان
document.getElementById("settingsBtn").onclick = () => {
  settingsPanel.hidden = false;
};

// داخستنی ڕێکخستنەکان
document.getElementById("closeSettings").onclick = () => {
  settingsPanel.hidden = true;
};

// گۆڕینی شار
city.addEventListener("change", () => {
  cityTitle.textContent =
    city.options[city.selectedIndex].textContent;

  savePreferences();
  loadCityPrayerTimes();
});

// گۆڕینی شێوازی کات
format.addEventListener("change", () => {
  savePreferences();
  updateClock();
  renderPrayerTimes();
});

// پاشەکەوتکردنی کاتە دەستکاریکراوەکان
document.getElementById("saveSettings").onclick = () => {
  const overrides = {};

  prayerNames.forEach(name => {
    const value =
      document.getElementById("time-" + name).value;

    if (value) {
      overrides[name] = value;
    }
  });

  localStorage.setItem(
    getOverrideKey(),
    JSON.stringify(overrides)
  );

  loadCityPrayerTimes();

  alert("کاتەکان پاشەکەوت کران.");
};

// گەڕاندنەوەی کاتە سەرەکییەکان
document.getElementById("resetTimes").onclick = () => {
  const confirmed = confirm(
    "دڵنیایت دەتەوێت دەستکارییەکانی ئەم شارە بسڕیتەوە؟"
  );

  if (!confirmed) return;

  localStorage.removeItem(getOverrideKey());
  loadCityPrayerTimes();
};

// بیرخەرەوەی ڕۆژی هەینی و شەو
function updateReminder() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Baghdad",
      hour: "numeric",
      hourCycle: "h23"
    }).format(new Date())
  );

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Baghdad",
    weekday: "long"
  }).format(new Date());

  if (weekday === "Friday") {
    reminder.textContent =
      "یادت نەچێت: خوێندنەوەی سورەتی الکهف و زۆرکردنی سەڵاوات.";
  } else if (hour >= 22) {
    reminder.textContent =
      "بیرخەرەوە: خوێندنەوەی سورەتی الملک.";
  } else {
    reminder.textContent = "";
  }
}

// دەستپێکردنی وێبسایت
loadPreferences();
loadCityPrayerTimes();

updateClock();
updateDate();
updateReminder();

setInterval(updateClock, 1000);
setInterval(updateDate, 5000);
setInterval(updateZikr, 7000);
setInterval(updateReminder, 60000);