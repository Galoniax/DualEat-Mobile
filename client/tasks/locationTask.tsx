import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const LOCATION_TASK_NAME = 'background-location-task';




TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error } : any) => {
  if (error) return console.error(error);
  if (data) {
    const { locations } = data;
    const { latitude, longitude } = locations[0].coords;

    const isNearStore = checkProximity(latitude, longitude);
    if (isNearStore) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Estás cerca!",
          body: "Pasás cerca de nuestro local, vení a visitarnos 🎉",
        },
        trigger: null,
      });
    }
  }
});

function checkProximity(lat: number, lng: number): boolean {
  const storeLat = -34.7001;
  const storeLng = -58.3089;
  const radius = 100; 

  const distance = getDistance(lat, lng, storeLat, storeLng);
  return distance < radius;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}