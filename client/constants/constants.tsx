import { Local } from "@/interface/global";

// Rutas de la aplicación
export const ROUTES = {
  PUBLIC: {
    HOME: "/(auth)/welcome",
  },
  AUTH: {
    LOGIN: "/(auth)/login",
    REGISTER: "/(auth)/register",
    ONBOARDING: "/(auth)/onboarding",
    RESET_PASSWORD: "/(auth)/password_recovery",
  },

  USER: {
    DASHBOARD_OUT: "/(client)/(out)",
    DASHBOARD_IN: "/(client)/(in)",
    CREATE_POST: "/post",
    EXPLORE: "/explore/",
    RECIPES: "/recipes/",
    COMMUNITY: "/c/",
    NOTIFICATIONS: "/notifications",
  },
  ADMIN: {
    BUSINESS_CREATION: "/admin/business-creation",
    FOOD_CATEGORIES: "/admin/food-categories",
    LOCALS: "/admin/locals",
  },
  LOCAL: {
    DASHBOARD: "/business/dashboard",
    CALENDAR: "/business/calendar",
    MENU: "/business/menu",
    QR: "/business/qr",
    REVIEWS: "/business/reviews",
    SETTINGS: "/business/settings",
  },
  LOADING: "/loading",
  ERROR: "/404",
} as const;

// Tipos de locales y su mapeo a íconos de Google
export const LOCAL_TYPES = [
  "Hamburguesería", 
  "Comida rápida",
  "Pizzería", 
  "Restaurante italiano",
  "Vegano",
  "Sushi bar",
  "Restaurante",
  "Cafetería",
  "Heladería",
  "Parrilla",
  "Bar"
];

export type LocalType = typeof LOCAL_TYPES[number];

const googleIconMap: Record<LocalType, string[]> = {
  "Hamburguesería": ["lunch_dining"], 
  "Comida rápida": ["fastfood"],
  "Pizzería": ["local_pizza"], 
  "Restaurante italiano": ["dinner_dining"],
  "Vegano": ["avocado_bean"],
  "Sushi bar": ["ramen_dining"],
  "Restaurante": ["restaurant"],
  "Cafetería": ["coffee"],
  "Heladería": ["icecream"],
  "Parrilla": ["outdoor_grill"],
  "Bar": ["liquor"],
  "Default": ["restaurant"]
};

// HTML base para el mapa con Leaflet
export const leafletHTML = (lat: number, lng: number, locals: Local[]) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
      html, body { margin: 0; padding: 0; height: 100%; }
      #map { height: 100vh; width: 100vw; }
      .leaflet-popup-content-wrapper { font-size: 14px; font-family: Arial; }
      button { padding: 5px 10px; margin-top: 6px; cursor: pointer; }
      
      .custom-user-marker { background: transparent; border: none; }
      
      .pin-marker {  
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 2px; 
  width: fit-content; 
}

.pin-shape { 
  background: #fff; 
  border-radius: 20px; 
  width: 65px; 
  height: 30px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 5px; 
  position: relative; 
}

.pin-shape::after { 
  content: ""; 
  position: absolute; 
  bottom: -13px; 
  left: 35%; 
  width: 0; 
  height: 0; 
  border: 7px solid transparent; 
  border-top-color: #fff; 
}

.text p {
  font-size: 10px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  margin-top: 13px;
  
  /* El truco: define un ancho máximo */
  max-width: 80px;  /* Ajusta según necesites */
  
  white-space: nowrap;     
  overflow: hidden;        
  text-overflow: ellipsis;
}

      .recenter-btn {
        background-color: white;
        width: 34px;
        height: 34px;
        border-radius: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 1px 5px rgba(0,0,0,0.65);
        border: 2px solid rgba(0,0,0,0.2);
        padding: 7px;
      }
      .recenter-btn:active { background-color: #f4f4f4; }
      .recenter-icon { width: 23px; height: 23px; fill: #444; }
    </style>

    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "js-error", message }));
      };

      let map;
      let userMarker = null;
      let localesMarkers = [];

      document.addEventListener("DOMContentLoaded", function () {
        try {
          map = L.map("map", { zoomControl: false }).setView([${lat}, ${lng}], 15);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
             minZoom: 10,
             maxZoom: 20
          }).addTo(map);

          const RecenterControl = L.Control.extend({
            options: { position: 'bottomright' },
            onAdd: function (map) {
              const container = L.DomUtil.create('div', 'recenter-btn leaflet-bar leaflet-control');
              container.innerHTML = \`<svg class="recenter-icon" viewBox="0 0 24 24">
                   <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>\`;
              container.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                if (userMarker) {
                   const latLng = userMarker.getLatLng();
                   map.flyTo(latLng, 16, { duration: 1.5 });
                }
              };
              L.DomEvent.disableClickPropagation(container);
              return container;
            }
          });
          map.addControl(new RecenterControl());

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "map-ready" }));
          updateUserLocation(${lat}, ${lng});

          // Enviar bounds apenas se carga 
          const bounds = getMapBounds(); 
            if (bounds) { 
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "bounds", bounds })); 
            } 
          
          // Y también cada vez que el usuario mueva/zoomee 
          map.on("moveend", () => { 
            const b = getMapBounds(); 
            if (b) { 
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "bounds", bounds: b })); 
            } 
          });

          updateLocales(${JSON.stringify(locals)});

          

        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "js-error", message: e.message }));
        }
      });

      

      function updateUserLocation(lat, lng) {
        if (!map) return;
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: \`<div style="position: relative;"><div style="position: absolute; width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div></div>\`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
        }
      }

      function getMapBounds() { 
      if (!map) return null; 
      const bounds = map.getBounds();
        return { 
          minLat: bounds.getSouth(), 
          maxLat: bounds.getNorth(), 
          minLng: bounds.getWest(), 
          maxLng: bounds.getEast(), 
        }; 
      }

      function updateLocales(list) {
        if (!map) return;
        localesMarkers.forEach(m => map.removeLayer(m));
        localesMarkers = [];

        const iconMap = ${JSON.stringify(googleIconMap)};


        list.forEach(loc => {
          const iconName = iconMap[loc.category] || iconMap["Default"];

          const customPin = L.divIcon({
            className: 'pin-marker',

            html: \`
            <div class="pin-shape">
              <i class="material-icons" style="font-size: 18px; color: #B53325;">\${iconName}</i>
              <p style="font-weight: bold; font-size: 14px;">\${loc.average_rating}</p>
            </div>
            <div class="text">
              <p>\${loc.name}</p>
            </div>
            \`,
          });

          

          const marker = L.marker([loc.latitude, loc.longitude], { icon: customPin })
          .addTo(map)
          .bindPopup("<b>" + loc.name + "</b>...");
          
          localesMarkers.push(marker);
        });
      }

      function openLocal(id) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "click", id }));
      }
    </script>
  </head>
  <body><div id="map"></div></body>
</html>
  `;
};