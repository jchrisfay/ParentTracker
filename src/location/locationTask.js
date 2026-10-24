// Background location task + start/stop controls for the CHILD device.
//
// On Android, startLocationUpdatesAsync with a `foregroundService` block runs a
// foreground service, which forces a persistent, non-dismissable notification
// in the status bar. That is the "small icon so the child is aware" requirement,
// and Android does not let the app hide it while the service runs.
//
// On iOS, the OS shows its own location-use indicator instead; there is no
// custom permanent icon, and no app can prevent the user from deleting the app.

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pushLocation } from "./familyRepo";

export const LOCATION_TASK = "familytrack-location";
const FAMILY_KEY = "familyId";

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("[locationTask]", error.message);
    return;
  }
  const locations = data?.locations;
  if (!locations || locations.length === 0) return;

  // The task has no React state; read the paired family id from storage.
  const familyId = await AsyncStorage.getItem(FAMILY_KEY);
  if (!familyId) return;

  const latest = locations[locations.length - 1];
  try {
    await pushLocation(familyId, latest.coords);
  } catch (e) {
    console.warn("[locationTask] push failed", e.message);
  }
});

// Request both foreground and background location permission.
// Returns { granted, background } so the UI can explain what's missing.
export async function requestPermissions() {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return { granted: false, background: false };
  const bg = await Location.requestBackgroundPermissionsAsync();
  return { granted: true, background: bg.status === "granted" };
}

export async function startTracking() {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (already) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true, // iOS blue bar
    foregroundService: {
      notificationTitle: "FamilyTrack is sharing your location",
      notificationBody: "Your parent can see where you are. Tap to open.",
      notificationColor: "#1f6feb",
    },
  });
}

export async function stopTracking() {
  const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (running) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export async function isTracking() {
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
}
