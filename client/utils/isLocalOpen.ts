const DAYS_MAP = [
  "DOMINGO", 
  "LUNES", 
  "MARTES", 
  "MIERCOLES", 
  "JUEVES", 
  "VIERNES", 
  "SABADO"
];

export function isLocalOpen(schedules: any[]): boolean {
  if (!schedules || schedules.length === 0) return false;

  const now = new Date();
  const currentDay = DAYS_MAP[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const todaySchedules = schedules.filter(s => s.day_of_week === currentDay);

  for (const schedule of todaySchedules) {
    const openMins = timeToMinutes(schedule.open_time);
    const closeMins = timeToMinutes(schedule.close_time);

    if (openMins < closeMins) {
      if (currentMinutes >= openMins && currentMinutes <= closeMins) {
        return true; 
      }
    } else {
      if (currentMinutes >= openMins) {
        return true;
      }
    }
  }

  const yesterdayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const yesterdayDay = DAYS_MAP[yesterdayIndex];
  const yesterdaySchedules = schedules.filter(s => s.day_of_week === yesterdayDay);

  for (const schedule of yesterdaySchedules) {
    const openMins = timeToMinutes(schedule.open_time);
    const closeMins = timeToMinutes(schedule.close_time);

    if (openMins > closeMins) {
      if (currentMinutes <= closeMins) {
        return true;
      }
    }
  }

  return false;
}