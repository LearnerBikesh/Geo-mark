'use strict';

const form = document.querySelector('.form');
const containerLocations = document.querySelector('.locations');

const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputDescription = document.querySelector('.form__input--description');

let map;
let mapEvent;

//  this webpage is made with the help of geolocation api and leaflet library

class Location {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration, description) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.description = description;
    this._setDescription();
  }


  // protected funtions (starting with _ prefix)
  _setDescription() {
    // prettier-ignore
    const months = [
      'January','February','March','April','May','June','July','August','September','October','November','December',
    ];

    this.heading = `on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()} - ${this.date.getFullYear()}`;
  }
}

class App {
  #map;   // private fields (starting with # prefix)
  #mapEvent;
  #locations = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newlocation.bind(this));

    containerLocations.addEventListener('click', this._moveToPopUp.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    const home = [25.4456219, 83.2813906];
    this.#map = L.map('map').setView(home, 13);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    L.marker(home).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapEv) {
    this.#mapEvent = mapEv;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newlocation(e) {
    e.preventDefault();

    const validInputs = (...inputs) => {
      return inputs.every(input => Number.isFinite(input));
    };

    const validPositive = (...inputs) => {
      return inputs.every(input => input >= 0);
    };

    // Get data from form
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const description = inputDescription.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let location;

    if (
      !validInputs(distance, duration) ||
      !validPositive(distance, duration)
    ) {
      return alert('Invalid Input field');
    }

    location = new Location([lat, lng], distance, duration, description);

    // Adding new object to location array
    this.#locations.push(location);

    // hidding form and clearing input field
    this._hideForm();

    // Rendering location on map as marker
    this.renderlocationMarker(location);

    // Rendering location
    this._renderlocation(location);
  }

  _hideForm() {
    inputDistance.value = inputDuration.value = inputDescription.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  renderlocationMarker(location) {
    L.marker(location.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${location.type}-popup`,
        })
      )
      .openPopup()
      .setPopupContent(location.description);
  }

  _renderlocation(location) {
    let html = `
    <li class="location" data-id=${location.id}>
      <h2 class="location__title">${location.heading}</h2>
      <div class="location__details">
        <span class="location__icon">🚴</span>
        <span class="location__value">${location.duration}</span>
        <span class="location__unit">km</span>
      </div>
      <div class="location__details">
        <span class="location__icon">📝</span>
        <span class="location__value">${location.description}</span>
      </div>
    </li>
  `;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopUp(e) {
    const locationEl = e.target.closest('.location');

    if (!locationEl) return;

    const location = this.#locations.find(
      work => work.id === locationEl.dataset.id
    );

    this.#map.setView(location.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
