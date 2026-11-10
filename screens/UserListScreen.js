
import React, { useEffect, useRef, useState } from "react";

import AddUserScreen from "./AddUserScreen";
import EditUserScreen from "./EditUserScreen";

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/firebaseConfig";

export default function UserListScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // ==================================================
  // 1. KHAI BÁO STATE
  // ==================================================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const deletingRef = useRef(false);

  // ==================================================
  // 2. LẤY DANH SÁCH NGƯỜI DÙNG TỪ FIRESTORE
  // ==================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const userList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setUsers(userList);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);

        setError(
          "Không thể tải dữ liệu: " + err.message
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==================================================
  // 3. XÓA NGƯỜI DÙNG CÓ XÁC NHẬN
  // ==================================================

  const handleDeleteUser = (user) => {
    const deleteUser = async () => {
      if (deletingRef.current) return;

      deletingRef.current = true;
      setDeletingId(user.id);

      try {
        await deleteDoc(doc(db, "users", user.id));
      } catch (err) {
        console.error("Delete user error:", err);

        const message =
          "Xóa thất bại: " + err.message;

        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Lỗi", message);
        }
      } finally {
        deletingRef.current = false;
        setDeletingId(null);
      }
    };

    const message =
      `Bạn có chắc chắn muốn xóa "${user.hoten}"?\n` +
      "Thao tác này không thể hoàn tác.";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteUser();
      }
    } else {
      Alert.alert(
        "Xác nhận xóa",
        message,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress: deleteUser,
          },
        ]
      );
    }
  };

  // ==================================================
  // 4. ĐIỀU HƯỚNG MÀN HÌNH THÊM VÀ SỬA
  // ==================================================

  if (showAddForm) {
    return (
      <AddUserScreen
        onBack={() => setShowAddForm(false)}
      />
    );
  }

  if (editingUser) {
    return (
      <EditUserScreen
        user={editingUser}
        onBack={() => setEditingUser(null)}
      />
    );
  }

  // ==================================================
  // 5. HIỂN THỊ TỪNG NGƯỜI DÙNG
  // ==================================================

  const renderUser = ({ item }) => (
    <View
      style={[
        styles.userCard,
        isMobile && styles.userCardMobile,
      ]}
    >
      {/* Ảnh đại diện và thông tin */}
      <View style={styles.userMain}>
        {item.hinhanh ? (
          <Image
            source={{ uri: item.hinhanh }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.placeholder,
            ]}
          >
            <Text style={styles.placeholderText}>
              👤
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.hoten}
          </Text>

          <Text style={styles.userEmail}>
            {item.email}
          </Text>
        </View>
      </View>

      {/* Nút sửa và xóa */}
      <View
        style={[
          styles.actionButtons,
          isMobile && styles.actionButtonsMobile,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.editButton,
            isMobile && styles.mobileButton,
          ]}
          onPress={() => setEditingUser(item)}
          disabled={deletingId !== null}
        >
          <Text style={styles.buttonText}>
            Sửa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            isMobile && styles.mobileButton,
            deletingId !== null && {
              opacity: 0.5,
            },
          ]}
          onPress={() => handleDeleteUser(item)}
          disabled={deletingId !== null}
        >
          <Text style={styles.buttonText}>
            {deletingId === item.id
              ? "Đang xóa..."
              : "Xóa"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==================================================
  // 6. GIAO DIỆN CHÍNH
  // ==================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      {/* THANH TIÊU ĐỀ */}
      <View
        style={[
          styles.header,
          isMobile && styles.headerMobile,
        ]}
      >
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              isMobile && styles.titleMobile,
            ]}
          >
            QUẢN LÝ NGƯỜI DÙNG
          </Text>

          <Text style={styles.subtitle}>
            React Native + Firebase Firestore
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isMobile && styles.logoutButtonMobile,
          ]}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.buttonText}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>

      {/* DANH SÁCH NGƯỜI DÙNG */}
      <View
        style={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
      >
        <Text style={styles.sectionTitle}>
          Danh sách người dùng
        </Text>

        <Text style={styles.count}>
          Tổng số: {users.length} người dùng
        </Text>

        {/* NÚT THÊM NGƯỜI DÙNG */}
        <View
          style={[
            styles.toolbar,
            isMobile && styles.toolbarMobile,
          ]}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.buttonText}>
              + Thêm người dùng
            </Text>
          </TouchableOpacity>
        </View>

        {/* HIỂN THỊ DỮ LIỆU */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={{ marginTop: 30 }}
          />
        ) : error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Chưa có người dùng nào.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================================================
// 7. STYLES WEB + IOS
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  // HEADER
  header: {
    backgroundColor: "#2563eb",
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 16,
    gap: 12,
  },

  headerText: {
    flexShrink: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#ffffff",
  },

  titleMobile: {
    fontSize: 20,
  },

  subtitle: {
    fontSize: 13,
    color: "#dbeafe",
    marginTop: 5,
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  logoutButtonMobile: {
    alignSelf: "flex-end",
  },

  // CONTENT
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    padding: 20,
  },

  contentMobile: {
    padding: 14,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },

  count: {
    color: "#64748b",
    marginBottom: 18,
  },

  // TOOLBAR
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  toolbarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  addButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 9,
    alignItems: "center",
  },

  // DANH SÁCH
  list: {
    paddingBottom: 24,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },

  userCardMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 14,
  },

  userMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  // ẢNH ĐẠI DIỆN
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#e2e8f0",
  },

  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 26,
  },

  // THÔNG TIN NGƯỜI DÙNG
  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },

  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 5,
    flexShrink: 1,
  },

  // NÚT SỬA VÀ XÓA
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  actionButtonsMobile: {
    width: "100%",
    marginTop: 12,
  },

  mobileButton: {
    flex: 1,
    alignItems: "center",
  },

  editButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },

  // THÔNG BÁO
  error: {
    color: "#dc2626",
    marginTop: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#64748b",
  },
});
