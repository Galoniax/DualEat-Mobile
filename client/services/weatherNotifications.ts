import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { getHomeDiscovery } from "./discovery.api";

export const BACKGROUND_WEATHER_TASK = "BACKGROUND_WEATHER_RECOMMENDATION";

export const CLIMATE_MAP: Record<string, string[]> = {
  calor: [
    "Helados",
    "Sushi",
    "Ensaladas",
    "Bebidas",
    "Cervezas y Tragos",
    "Postres",
    "Comida Japonesa",
    "Comida Brasileña",
  ],
  frio: [
    "Pastas",
    "Infusiones",
    "Parrila",
    "Milanesas",
    "Woks",
    "Comida India",
    "Comida Francesa",
    "Comida Vietnamita",
    "Comida Medio Oriente",
    "Comida Coreana",
    "Comida Dulce",
  ],
  lluvia: [
    "Pizzas",
    "Hamburguesas",
    "Empanadas",
    "Sandwiches",
    "Panchos",
    "Para Picar",
    "Desayunos/Merienda",
    "Infusiones",
    "Arepas",
    "Comida Mexicana",
    "Comida Árabe",
    "Comida Italiana",
    "Comida Peruana",
  ],
};

export async function getWeatherRecommendations(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    );

    if (!response.ok) throw new Error("Error al conectar con Open-Meteo");

    const data = await response.json();
    const temp = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;

    let climaActual = "frio"; // por defecto

    // Códigos de Open-Meteo para lluvia/tormenta van del 51 al 67, y del 80 al 86
    const esLluvia =
      (weatherCode >= 51 && weatherCode <= 67) ||
      (weatherCode >= 80 && weatherCode <= 86);

    if (esLluvia) {
      climaActual = "lluvia";
    } else if (temp > 25) {
      climaActual = "calor";
    }

    const categoriasRecomendadas = CLIMATE_MAP[climaActual];

    // Obtener recomendación de home discovery
    const discoveryRes = await getHomeDiscovery(lat, lon);
    let alimentosRecomendados: any[] = [];

    if (discoveryRes.success && discoveryRes.data) {
      const homeData = discoveryRes.data as any;
      const allFoods = [
        ...(homeData.para_ti || []),
        ...(homeData.ofertas_hot || []),
        ...(homeData.mas_pedidos || []),
      ];

      // Eliminar duplicados por ID
      const uniqueFoods = Array.from(
        new Map(allFoods.map((item: any) => [item.id, item])).values(),
      );

      // Filtrar alimentos que coincidan con las categorías recomendadas
      alimentosRecomendados = uniqueFoods.filter((food: any) => {
        const categoryName = food.category?.name?.toLowerCase();
        return (
          categoryName &&
          categoriasRecomendadas.some(
            (cat) => cat.toLowerCase() === categoryName,
          )
        );
      });

      // Si no hay alimentos de la categoría específica del clima, usar los de para_ti
      if (alimentosRecomendados.length === 0) {
        alimentosRecomendados = homeData.para_ti || [];
      }
    }

    return {
      clima: { temp, estado: climaActual, code: weatherCode },
      recomendaciones: alimentosRecomendados,
    };
  } catch (error) {
    console.error("Error obteniendo clima, fallback a genéricos", error);
    return fallbackRecommendations(lat, lon);
  }
}

async function fallbackRecommendations(lat: number, lon: number) {
  try {
    const discoveryRes = await getHomeDiscovery(lat, lon);
    if (discoveryRes.success && discoveryRes.data) {
      const homeData = discoveryRes.data as any;
      return {
        clima: { temp: null, estado: "unknown", code: null },
        recomendaciones: homeData.para_ti || [],
      };
    }
  } catch (e) {
    console.error("Error en fallback de recomendaciones:", e);
  }
  return {
    clima: { temp: null, estado: "unknown", code: null },
    recomendaciones: [],
  };
}

// 2. Función para disparar la recomendación y notificación manualmente (útil para pruebas)
export async function triggerWeatherNotificationManually() {
  try {
    const locationStr = await AsyncStorage.getItem("@last_known_location");
    if (!locationStr) {
      console.log("Task weather: No last location stored.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { coords } = JSON.parse(locationStr);
    if (!coords || !coords.latitude || !coords.longitude) {
      console.log("Task weather: Invalid location stored.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const result = await getWeatherRecommendations(
      coords.latitude,
      coords.longitude,
    );

    const foods = result.recomendaciones;

    console.log("RESULT", JSON.stringify(foods, null, 2));

    if (foods && foods.length > 0) {
      const randomIndex = Math.floor(Math.random() * foods.length);
      const food = foods[randomIndex];
      const local = food.local;

      let notificationTitle = "¡Recomendación del día!";
      let notificationBody = `¿Qué te parece probar ${food.name} de ${local.name}?`;

      const status = result.clima.estado;
      if (status === "calor") {
        notificationTitle = "¡Hace calor! Un antojo refrescante ☀️";
        notificationBody = `¿Qué tal un/a delicioso/a ${food.name} de ${local.name} para refrescarte?`;
      } else if (status === "frio") {
        notificationTitle = "Ideal para este clima fresquito ❄️";
        notificationBody = `¿Qué te parece calentar el día con ${food.name} de ${local.name}?`;
      } else if (status === "lluvia") {
        notificationTitle = "Día lluvioso... ¡Consiéntete! 🌧️";
        notificationBody = `Con esta lluvia se antoja ${food.name} de ${local.name}. ¡Date un gusto!`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationTitle,
          body: notificationBody,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            local_id: local.id,
            food_id: food.id,
            type: "WEATHER_RECOMMENDATION",
            url: `dualeat://local/${local.id}`,
          },
        },
        trigger: null,
      });

      console.log("Task weather: Notification sent.");
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log("Task weather: No food recommendations found.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Task weather execution failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

// Definición de tarea fantasma para evitar crasheos si el OS intenta despertarla
TaskManager.defineTask("background-location-task", async () => {
  console.log("Dummy background-location-task executed.");
});

// 3. Definición de la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
  return await triggerWeatherNotificationManually();
});

// 4. Registrar la tarea en segundo plano
export async function registerBackgroundWeatherTask() {
  try {
    // Limpiar la tarea fantasma si quedó registrada anteriormente en el dispositivo
    try {
      const hasLocationTask = await TaskManager.isTaskRegisteredAsync("background-location-task");
      if (hasLocationTask) {
        console.log("Limpiando tarea obsoleta background-location-task...");
        await TaskManager.unregisterTaskAsync("background-location-task");
      }
    } catch (err) {
      console.log("Error al limpiar background-location-task:", err);
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_WEATHER_TASK,
    );
    if (!isRegistered) {
      console.log("Registrando tarea en segundo plano de clima...");
      await BackgroundFetch.registerTaskAsync(BACKGROUND_WEATHER_TASK, {
        minimumInterval: 7 * 60 * 60, // 7 horas en segundos
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Tarea de clima registrada exitosamente.");
    } else {
      console.log("La tarea de clima ya está registrada.");
    }
  } catch (error) {
    console.error("Error al registrar tarea de clima:", error);
  }
}
