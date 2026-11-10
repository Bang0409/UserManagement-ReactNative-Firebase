
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function EditUserScreen({ user, onBack }) {
  const [email, setEmail] = useState(user.email || "");
  const [hoten, setHoten] = useState(user.hoten || "");
  const [hinhanh, setHinhanh] = useState(user.hinhanh || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setMessage("");

    if (!email.trim() || !hoten.trim()) {
      setMessage("Vui lòng nhập email và họ tên.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setMessage("Email không đúng định dạng.");
      return;
    }

    if (hinhanh.trim() && !/^https:\/\//i.test(hinhanh.trim())) {
      setMessage("URL hình ảnh phải bắt đầu bằng https://");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.id);

      await updateDoc(userRef, {
        email: email.trim().toLowerCase(),
        hoten: hoten.trim(),
        hinhanh: hinhanh.trim(),
      });

      onBack();
    } catch (error) {
      console.error("Update user error:", error);
      setMessage("Cập nhật thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.title}>SỬA NGƯỜI DÙNG</Text>

        <Text style={styles.subtitle}>
          Cập nhật thông tin người dùng trên Firestore
        </Text>

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          value={hoten}
          onChangeText={setHoten}
        />

        <Text style={styles.label}>URL hình ảnh</Text>
        <TextInput
          style={styles.input}
          value={hinhanh}
          onChangeText={setHinhanh}
          autoCapitalize="none"
        />

        {hinhanh.startsWith("https://") && (
          <Image
            source={{ uri: hinhanh }}
            style={styles.preview}
          />
        )}

        <Text style={styles.note}>
          Trường matkhau được giữ nguyên, không chỉnh sửa.
        </Text>

        {message ? (
          <Text style={styles.error}>{message}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              CẬP NHẬT NGƯỜI DÙNG
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.cancelText}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    paddingHorizontal: 14,
    marginBottom: 18,
    fontSize: 15,
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 18,
  },
  note: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 18,
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    marginBottom: 15,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "bold",
  },
});
