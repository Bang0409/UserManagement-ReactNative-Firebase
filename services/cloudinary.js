import { Platform } from "react-native";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

const CLOUD_NAME = "ifzvc3g4";
const UPLOAD_PRESET = "user_management_unsigned";

export async function uploadImageToCloudinary(asset) {
  if (!asset?.uri) {
    throw new Error("Chưa chọn hình ảnh.");
  }

  // Giới hạn kích thước ảnh 5 MB
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
    throw new Error("Ảnh không được vượt quá 5 MB.");
  }

  const formData = new FormData();

  if (Platform.OS === "web") {
    // Xử lý ảnh trên trình duyệt Web
    if (asset.file) {
      formData.append("file", asset.file);
    } else {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      formData.append(
        "file",
        blob,
        asset.fileName || "avatar.jpg"
      );
    }
  } else {
    // Xử lý ảnh trên iOS và Android
    const file = new File(asset.uri);

    formData.append("file", file);
  }

  formData.append("upload_preset", UPLOAD_PRESET);

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // Sử dụng expoFetch trên thiết bị di động
  const response = await (
    Platform.OS === "web" ? fetch : expoFetch
  )(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(
      result.error?.message ||
      "Không thể tải ảnh lên Cloudinary."
    );
  }

  return result.secure_url;
}