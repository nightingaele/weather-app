let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function updateCurrentTime() {
  let currentTime = new Date();
  let day = days[currentTime.getDay()]; // returns a value between 0 and 6.

  let hours = currentTime.getHours();
  let minutes = String(currentTime.getMinutes()).padStart(2, "0");

  currentTime = `${day}, ${hours}:${minutes}`;

  let currentTimeText = document.querySelector("#current-time");
  currentTimeText.innerHTML = currentTime;
}

let apiKey = "a8730d7b28118354d14e2046c817ba28";
let units = "metric";

function generateForecastHTML(day, img, tempRange, condition) {
  return `
    <div class="col centered">
      <div class="row align-items-center">
        <div class="col">
          <div class="align-self-center">
            <span class="day-text">${day}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="align-self-center">
            <img
              class="icon centered-img"
              id="forecast-${day}-icon"
              src="${img}"
              alt="${condition}"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <span class="temp-range"><strong>${tempRange.max}°</strong> | ${tempRange.min}°</span>
        </div>
      </div>
    </div>
  `;
}

function updateCurrentWeather(weatherData, locationData) {
  let temperatureElement = document.querySelector("#current-temp");
  let cityElement = document.querySelector("#current-city");
  let humidityElement = document.querySelector("#current-humidity");
  let windSpeedElement = document.querySelector("#current-wind-speed");
  let feelsLikeElement = document.querySelector("#current-wind-chill");
  let descriptionElement = document.querySelector("#description");
  let iconElement = document.querySelector(".icon");
  let flagElement = document.querySelector("#flag");

  celsiusTemp = weatherData.temp;
  celsiusFeelsLike = weatherData.feels_like;

  temperatureElement.innerHTML = Math.round(celsiusTemp);
  cityElement.innerHTML = locationData.name;
  humidityElement.innerHTML = `${weatherData.humidity}%`;
  windSpeedElement.innerHTML = `${Math.round(
    weatherData.wind_speed * 3.6
  )} km/h`;
  feelsLikeElement.innerHTML = `${Math.round(celsiusFeelsLike)}°C`;
  descriptionElement.innerHTML = `${weatherData.weather[0].description}`;
  iconElement.setAttribute(
    "src",
    `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", weatherData.weather[0].description);
  flagElement.setAttribute(
    "class",
    `flag flag-${locationData.country.toLowerCase()}`
  );
  flagElement.setAttribute("alt", locationData.country);
  updateCurrentTime();
}

function handleWeatherResponse(response, locationData) {
  console.log(response.data);
  updateCurrentWeather(response.data.current, locationData);
}

function search(city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}`;
  let lat;
  let lon;
  axios.get(`${apiUrl}&appid=${apiKey}`).then((response) => {
    console.log(response.data);
    lat = response.data.coord.lat;
    lon = response.data.coord.lon;
    let locationData = {
      country: response.data.sys.country,
      name: response.data.name,
    };
    apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}`;
    axios
      .get(`${apiUrl}&appid=${apiKey}`)
      .then((response) => handleWeatherResponse(response, locationData));
  });
}

function handleSearch(event) {
  event.preventDefault();
  let input = document.querySelector("#city-input");
  search(input.value);
}

let celsiusTemp = null;
let celsiusFeelsLike = null;

let form = document.querySelector("#search-bar");
form.addEventListener("submit", handleSearch);

let currentLocationBtn = document.querySelector("#current-loc");
currentLocationBtn.addEventListener("click", (event) => {
  navigator.geolocation.getCurrentPosition((position) => {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}`;
    axios.get(`${apiUrl}&appid=${apiKey}`).then((response) => {
      let locationData = {
        country: response.data.sys.country,
        name: response.data.name,
      };
      apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${units}`;
      axios
        .get(`${apiUrl}&appid=${apiKey}`)
        .then((response) => handleWeatherResponse(response, locationData));
    });
  });
});

function toFahrenheit(temp) {
  return (temp * 9) / 5 + 32;
}

function displayFahrenheitTemp(event) {
  event.preventDefault();
  let temperatureElement = document.querySelector("#current-temp");
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let fahrenheitTemp = toFahrenheit(celsiusTemp);
  temperatureElement.innerHTML = Math.round(fahrenheitTemp);
  let fahrenheitFeelsLike = toFahrenheit(celsiusFeelsLike);
  let feelsLikeElement = document.querySelector("#current-wind-chill");
  feelsLikeElement.innerHTML = `${Math.round(fahrenheitFeelsLike)}°F`;
}

function displayCelsiusTemp(event) {
  event.preventDefault();
  let temperatureElement = document.querySelector("#current-temp");
  fahrenheitLink.classList.remove("active");
  celsiusLink.classList.add("active");
  temperatureElement.innerHTML = Math.round(celsiusTemp);
  let feelsLikeElement = document.querySelector("#current-wind-chill");
  feelsLikeElement.innerHTML = `${Math.round(celsiusFeelsLike)}°C`;
}

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheitTemp);

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", displayCelsiusTemp);

//default city
search("Winnipeg");
