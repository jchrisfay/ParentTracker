import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors } from "../theme";
import { subscribeChild, subscribeStopRequest, approveStop, denyStop, clearStopRequest } from "../location/familyRepo";

function speedKmh(ms) {
  if (ms == null || ms < 0) return "—";
  return (ms * 3.6).toFixed(1) + " km/h";
}

function ago(ts) {
  if (!ts) return "never";
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  return Math.round(s / 3600) + "h ago";
}

export default function ParentDashboardScreen({ familyId, onReset }) {
  const [childData, setChildData] = useState({});
  const [stopReq, setStopReq] = useState(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    const unsub1 = subscribeChild(familyId, setChildData);
    const unsub2 = subscribeStopRequest(familyId, setStopReq);
    return () => { unsub1(); unsub2(); };
  }, [familyId]);

  const loc = childData.location;
  const showStopModal = stopReq && stopReq.status === "pending";

  async function approve() {
    const ok = await approveStop(familyId, pin);
    if (!ok) {
      Alert.alert("Wrong PIN", "That PIN doesn't match.");
      return;
    }
    setPin("");
    // Child stops on its own when it sees "approved"; clear shortly after.
    setTimeout(() => clearStopRequest(familyId), 4000);
  }

  return (
    <View style={styles.container}>
      {loc ? (
        <MapView
          style={StyleSheet.absoluteFill}
          region={{ latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        >
          <Marker coordinate={{ latitude: loc.lat, longitude: loc.lng }} title="Child" description={speedKmh(loc.speed)} />
        </MapView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Waiting for the child's phone to start sharing…</Text>
          <Text style={styles.code}>Pairing code: {familyId}</Text>
        </View>
      )}

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Status</Text>
        <Text style={styles.panelValue}>
          {childData.status === "tracking" ? "Sharing" : "Stopped"} · updated {ago(childData.lastSeen)}
        </Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>{speedKmh(loc?.speed)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{loc?.accuracy ? Math.round(loc.accuracy) + " m" : "—"}</Text>
          </View>
        </View>
        <View style={styles.panelFooter}>
          <Text style={styles.codeDim}>Pairing code: {familyId}</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Reset this phone?", "For testing only: forgets this family on this device.", [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: () => onReset?.() },
              ])
            }
          >
            <Text style={styles.reset}>Reset (testing)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!showStopModal} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Child asked to stop sharing</Text>
            <Text style={styles.modalBody}>Enter your approval PIN to let them turn it off.</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={setPin}
              placeholder="Approval PIN"
              placeholderTextColor={colors.dim}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
            />
            <TouchableOpacity style={styles.approveBtn} onPress={approve}>
              <Text style={styles.btnText}>Approve stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyBtn} onPress={() => { denyStop(familyId); setPin(""); }}>
              <Text style={styles.denyText}>Deny</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { color: colors.dim, fontSize: 16, textAlign: "center" },
  code: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: 3, marginTop: 16 },
  panel: { position: "absolute", left: 12, right: 12, bottom: 24, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16 },
  panelLabel: { color: colors.dim, fontSize: 12, textTransform: "uppercase" },
  panelValue: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 2 },
  row: { flexDirection: "row", marginTop: 12 },
  stat: { flex: 1 },
  statLabel: { color: colors.dim, fontSize: 12 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "700" },
  panelFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  codeDim: { color: colors.dim, fontSize: 12 },
  reset: { color: colors.dim, fontSize: 12, textDecorationLine: "underline" },
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modal: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  modalBody: { color: colors.dim, fontSize: 14, marginTop: 6, marginBottom: 14 },
  input: { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: 10, color: colors.text, padding: 14, fontSize: 18, letterSpacing: 4 },
  approveBtn: { backgroundColor: colors.good, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 14 },
  denyBtn: { padding: 12, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  denyText: { color: colors.bad, fontWeight: "700", fontSize: 15 },
});
