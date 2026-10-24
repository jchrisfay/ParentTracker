import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { colors } from "../theme";
import { startTracking, stopTracking, isTracking } from "../location/locationTask";
import { subscribeStopRequest, requestStop, clearStopRequest, setChildStatus } from "../location/familyRepo";

// Child view: shows that sharing is on and lets the child ASK to stop.
// Actually stopping only happens after the parent approves (status -> approved).
export default function ChildTrackingScreen({ familyId }) {
  const [tracking, setTracking] = useState(false);
  const [requestState, setRequestState] = useState(null);

  useEffect(() => {
    (async () => {
      await startTracking();
      setTracking(await isTracking());
    })();

    const unsub = subscribeStopRequest(familyId, async (req) => {
      setRequestState(req?.status ?? null);
      if (req?.status === "approved") {
        await stopTracking();
        await setChildStatus(familyId, "stopped");
        setTracking(false);
        await clearStopRequest(familyId);
        Alert.alert("Sharing stopped", "Your parent approved. Location sharing is off.");
      }
      if (req?.status === "denied") {
        Alert.alert("Request denied", "Your parent kept sharing on.");
      }
    });
    return () => unsub();
  }, [familyId]);

  async function askToStop() {
    await requestStop(familyId);
    Alert.alert("Request sent", "Your parent needs to approve this on their phone.");
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: tracking ? colors.good : colors.dim }]} />
      <Text style={styles.title}>{tracking ? "Sharing is on" : "Sharing is off"}</Text>
      <Text style={styles.sub}>
        {tracking
          ? "Your location is shared with your parent. The notification in your status bar shows this is running."
          : "Location sharing is currently off."}
      </Text>

      {tracking && (
        <TouchableOpacity
          style={[styles.btn, requestState === "pending" && styles.btnDisabled]}
          onPress={askToStop}
          disabled={requestState === "pending"}
        >
          <Text style={styles.btnText}>
            {requestState === "pending" ? "Waiting for parent to approve…" : "Ask parent to stop sharing"}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.note}>Paired to family {familyId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center", alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8, marginBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  sub: { color: colors.dim, fontSize: 15, textAlign: "center", marginTop: 12, lineHeight: 22 },
  btn: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 32, alignSelf: "stretch" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  note: { color: colors.dim, fontSize: 12, marginTop: 24 },
});
