import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function RoleSelectScreen({ onPick }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FamilyTrack</Text>
      <Text style={styles.sub}>Set up this phone. You only do this once.</Text>

      <TouchableOpacity style={styles.card} onPress={() => onPick("parent")}>
        <Text style={styles.cardTitle}>This is the parent's phone</Text>
        <Text style={styles.cardBody}>
          See your child's live location and speed. You approve when they ask to
          stop sharing.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => onPick("child")}>
        <Text style={styles.cardTitle}>This is the child's phone</Text>
        <Text style={styles.cardBody}>
          Shares location with the parent. A notification stays visible the
          whole time so it's clear sharing is on.
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Everyone using this app should know it's installed. It's for families
        who agree to share location — not secret monitoring.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", textAlign: "center" },
  sub: { color: colors.dim, fontSize: 15, textAlign: "center", marginTop: 8, marginBottom: 28 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 20, marginBottom: 16 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  cardBody: { color: colors.dim, fontSize: 14, marginTop: 6, lineHeight: 20 },
  note: { color: colors.dim, fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },
});
