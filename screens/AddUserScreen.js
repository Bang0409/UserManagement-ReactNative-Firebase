
import { uploadImageToCloudinary } from "../services/cloudinary";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

import { addDoc, collection } from "firebase/firestore";
import * as Crypto from "expo-crypto";
import { db } from "../firebase/firebaseConfig";

export default function AddUserScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [hoten, setHoten] = useState("");
  const [hinhanh, setHinhanh] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Chọn ảnh từ thiết bị
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setMessage("Bạn cần cấp quyền truy cập thư viện ảnh.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
        setMessage("");
      }
    } catch (error) {
      setMessage("Không thể chọn ảnh: " + error.message);
    }
  };

  // Thêm người dùng vào Firestore
  const handleAddUser = async () => {
    if (loading) return;

    setMessage("");

    if (!email.trim() || !matkhau || !hoten.trim()) {
      setMessage("Vui lòng nhập email, mật khẩu demo và họ tên.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setMessage("Email không đúng định dạng.");
      return;
    }

    if (matkhau.length < 6) {
      setMessage("Mật khẩu demo phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      // Chỉ sử dụng mật khẩu demo, không dùng mật khẩu thật
      const salt = Crypto.randomUUID();

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        salt + ":" + matkhau
      );

      // Chọn URL ảnh hoặc tải ảnh từ thiết bị lên Cloudinary
      let imageUrl = hinhanh.trim();

      if (selectedImage) {
        imageUrl = await uploadImageToCloudinary(selectedImage);
      }

      // Chỉ lưu đúng 4 trường theo đề thi
      const newUser = {
        email: email.trim().toLowerCase(),
        matkhau: `demo-sha256$${salt}$${hash}`,
        hoten: hoten.trim(),
        hinhanh: imageUrl,
      };

      await addDoc(collection(db, "users"), newUser);

      // Xóa dữ liệu biểu mẫu
      setEmail("");
      setMatkhau("");
      setHoten("");
      setHinhanh("");
      setSelectedImage(null);
      setMessage("");

      onBack();
    } catch (error) {
      console.error("Add user error:", error);
      setMessage("Thêm thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          THÊM NGƯỜI DÙNG
        </Text>

        <Text style={styles.subtitle}>
          Nhập thông tin để lưu vào Cloud Firestore
        </Text>

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="off"
          autoCorrect={false}
        />

        {/* Mật khẩu demo */}
        <Text style={styles.label}>Mật khẩu demo *</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={matkhau}
          onChangeText={setMatkhau}
          secureTextEntry
          autoComplete="off"
          autoCorrect={false}
        />

        {/* Họ tên */}
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={hoten}
          onChangeText={setHoten}
          autoComplete="off"
          autoCorrect={false}
        />

        {/* Chọn hình ảnh */}
        <TouchableOpacity
          style={styles.pickButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.pickButtonText}>
            CHỌN ẢNH TỪ THIẾT BỊ
          </Text>
        </TouchableOpacity>

        {/* Xem trước ảnh từ thiết bị */}
        {selectedImage && (
          <View style={styles.selectedContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.preview}
            />

            <Text style={styles.selectedText}>
              Đã chọn ảnh từ thiết bị
            </Text>
          </View>
        )}

        {/* URL hình ảnh */}
        <Text style={styles.label}>URL hình ảnh</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={hinhanh}
          onChangeText={setHinhanh}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />

        {/* Xem trước ảnh bằng URL */}
        {!selectedImage && hinhanh.startsWith("https://") && (
          <Image
            source={{ uri: hinhanh }}
            style={styles.preview}
          />
        )}

        {/* Thông báo lỗi */}
        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}

        {/* Lưu người dùng */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && { opacity: 0.6 },
          ]}
          onPress={handleAddUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              LƯU NGƯỜI DÙNG
            </Text>
          )}
        </TouchableOpacity>

        {/* Quay lại */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.cancelText}>
            QUAY LẠI
          </Text>
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
    color: "#64748b",
    textAlign: "center",
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
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 18,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#0f172a",
  },

  preview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 18,
  },

  message: {
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

  pickButton: {
    backgroundColor: "#0d9488",
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginBottom: 16,
  },

  pickButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  selectedContainer: {
    alignItems: "center",
    marginBottom: 18,
  },

  selectedText: {
    color: "#16a34a",
    fontSize: 13,
  },
});
