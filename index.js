require("dotenv").config();
const Mustache = require("mustache");
const fetch = require("node-fetch");
const fs = require("fs");
const puppeteerService = require("./services/puppeteer.service");

const MUSTACHE_MAIN_DIR = "./main.mustache";

let DATA = {
  refresh_date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/Stockholm",
  }),
};

async function setWeatherInformation() {
  try {
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=stockholm&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`)
      .then((r) => r.json())
      .then((r) => {
        console.log("🚀 ~ .then ~ r:", r);
        DATA.city_temperature = Math.round(r.main.temp);
        DATA.city_weather = r.weather[0].description;
        DATA.city_weather_icon = r.weather[0].icon;
        DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Stockholm",
        });
        DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Stockholm",
        });
      });
  } catch (error) {
    console.log(error);
  }
}

async function setInstagramPosts() {
  const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount("visitbavaria", 3);
  console.log("🚀 ~ setInstagramPosts ~ instagramImages:", instagramImages);
  DATA.img1 = instagramImages[0];
  DATA.img2 = instagramImages[1];
  DATA.img3 = instagramImages[2];
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}

async function action() {
  /**
   * Fetch Weather
   */
  // await setWeatherInformation();

  /**
   * Get pictures
   */
  await setInstagramPosts();

  /**
   * Generate README
   */
  await generateReadMe();

  /**
   * Fermeture de la boutique 👋
   */
  await puppeteerService.close();
}

action();
