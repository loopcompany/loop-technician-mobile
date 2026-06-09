import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor10, themeColor2, themeColor6, themeColor7, themeColor8, themeColor4 } from '../theme/Color';
import { uploadArchiveImages, getArchiveImages, deleteArchiveImage } from '../services/Api';
import { showAlert } from '../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3; // 3 تصویر در هر ردیف با فاصله


export default function PhotoArchiveScreen({ navigation }) {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // دریافت لیست تصاویر از سرور
  const fetchImages = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const response = await getArchiveImages();

      if (response.success && response.data) {
        setImages(response.data);
        console.log(`✅ ${response.data.length} تصویر دریافت شد`);
      }
    } catch (error) {
      console.log('❌ خطا در دریافت تصاویر:', error);
      showAlert(t("Error"), error.message || t("Error fetching images"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchImages(true);
  };

  // انتخاب و آپلود تصاویر
  const handlePickImages = async () => {
    try {
      // برای وب از input file استفاده می‌کنیم
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (e) => {
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            // محدود کردن به 10 تصویر
            const limitedFiles = files.slice(0, 10);

            // تبدیل فایل‌های وب به فرمت مورد نیاز
            const assets = await Promise.all(
              limitedFiles.map(async (file) => {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    resolve({
                      uri: event.target.result,
                      fileName: file.name,
                      type: file.type,
                      file: file, // نگه داشتن فایل اصلی برای آپلود
                    });
                  };
                  reader.readAsDataURL(file);
                });
              })
            );

            await handleUploadImages(assets);
          }
        };

        input.click();
        return;
      }

      // برای موبایل از ImagePicker استفاده می‌کنیم
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showAlert(t("Error"), t("Gallery access is required"));
        return;
      }

      // انتخاب تصاویر (حداکثر 10)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadImages(result.assets);
      }
    } catch (error) {
      console.log('❌ خطا در انتخاب تصاویر:', error);
      showAlert(t("Error"), t("Error selecting image"));
    }
  };

  // آپلود تصاویر به سرور
  const handleUploadImages = async (selectedImages) => {
    try {
      setUploading(true);

      console.log('🖼️ تعداد تصاویر انتخاب شده:', selectedImages.length);

      const imagesToUpload = selectedImages.map((asset, index) => {
        // استخراج نام فایل
        let fileName;
        if (asset.fileName) {
          fileName = asset.fileName;
        } else if (asset.uri) {
          const uriParts = asset.uri.split('/');
          fileName = uriParts[uriParts.length - 1] || `photo_${Date.now()}_${index}.jpg`;
        } else {
          fileName = `photo_${Date.now()}_${index}.jpg`;
        }

        console.log(`📷 تصویر ${index + 1}:`, {
          uri: asset.uri,
          fileName: fileName,
          type: asset.type,
          hasFile: !!asset.file,
        });

        // برای وب، فایل اصلی رو برمی‌گردونیم
        if (Platform.OS === 'web' && asset.file) {
          return {
            uri: asset.uri,
            fileName: fileName,
            file: asset.file, // فایل اصلی برای آپلود در وب
          };
        }

        return {
          uri: asset.uri,
          fileName: fileName,
        };
      });

      const response = await uploadArchiveImages(imagesToUpload);

      if (response.success) {
        showAlert(t("Success"), response.message || t("Images uploaded successfully"));
        fetchImages(); // بروزرسانی لیست
      }
    } catch (error) {
      console.log('❌ خطا در آپلود تصاویر:', error);
      showAlert(t("Error"), error.message || t("Error uploading images"));
    } finally {
      setUploading(false);
    }
  };

  // حذف تصویر
  const handleDeleteImage = (imageId) => {
    setShowImageModal(false); // بستن مودال
    showAlert(
      t("Delete image"),
      t("Are you sure you want to delete this image?"),
      [
        { text: t("Cancel"), style: 'cancel' },
        {
          text: t("Delete"),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteArchiveImage(imageId);

              if (response.success) {
                showAlert(t("Success"), t("Image deleted successfully"));
                fetchImages(); // بروزرسانی لیست
                setSelectedImage(null);
              }
            } catch (error) {
              console.log('❌ خطا در حذف تصویر:', error);
              showAlert(t("Error"), error.message || t("Error deleting image"));
            }
          },
        },
      ]
    );
  };

  // نمایش تصویر در مودال
  const handleImagePress = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // ذخیره تصویر در گالری
  const handleSaveImage = async () => {
    if (!selectedImage) return;

    try {
      setDownloading(true);

      // برای وب از دانلود مستقیم استفاده می‌کنیم
      if (Platform.OS === 'web') {
        // ایجاد لینک دانلود
        const link = document.createElement('a');
        link.href = selectedImage.image_url;
        link.download = selectedImage.image_path.split('/').pop() || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert(t("Success"), t("Image downloaded"));
        setDownloading(false);
        return;
      }

      // برای موبایل از MediaLibrary استفاده می‌کنیم
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        showAlert(t("Error"), t("Gallery access is required"));
        return;
      }

      // دانلود و ذخیره تصویر
      const fileUri = FileSystem.documentDirectory + selectedImage.image_path.split('/').pop();

      console.log('📥 در حال دانلود تصویر از:', selectedImage.image_url);
      console.log('📁 ذخیره در:', fileUri);

      const downloadResult = await FileSystem.downloadAsync(
        selectedImage.image_url,
        fileUri
      );

      if (downloadResult.status === 200) {
        // ذخیره در گالری
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('Loop', asset, false);

        showAlert(t("Success"), t("Image saved to gallery"));
      } else {
        throw new Error('خطا در دانلود تصویر');
      }
    } catch (error) {
      console.log('❌ خطا در ذخیره تصویر:', error);
      showAlert(t("Error"), t("Error saving image"));
    } finally {
      setDownloading(false);
    }
  };

  // رندر هر تصویر
  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => handleImagePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteImage(item.id)}
      >
        <Ionicons name="trash" size={18} color={themeColor4.bgColor(1)} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // رندر هدر لیست
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickImages}
          disabled={uploading}
        >
          <View>
            <Ionicons name="cloud-upload" size={24} color={themeColor4.bgColor(1)} />
          </View>
          <Text style={[styles.uploadButtonText]}>
            {uploading ? t("Uploading...") : t("Upload image")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color={themeColor10.bgColor(0.7)} />
        <Text style={[NewStyles.text4, styles.infoText]}>
          {t("Each image is up to 5 MB")}
        </Text>
      </View>

      {images.length > 0 && (
        <View style={styles.countContainer}>
          <Ionicons name="images" size={20} color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.title, styles.countText]}>
            {t("Image count:")} {images.length}
          </Text>
        </View>
      )}
    </View>
  );

  // رندر حالت خالی
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="image-outline" size={80} color={themeColor10.bgColor(0.3)} />
      <Text style={[NewStyles.text, styles.emptyText]}>{t("No images found")}</Text>
      <Text style={[NewStyles.text4, styles.emptySubText]}>
        {t("To get started, upload your images")}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={t("Photo Archive")}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.loadingText]}>{t("Loading...")}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'off' }}
      style={NewStyles.container}
    >
      <ScreenHeaders
        title={t("Photo Archive")}
      />

      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.container}
        columnWrapperStyle={images.length > 0 ? styles.row : null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor0.bgColor(1)]}
            tintColor={themeColor0.bgColor(1)}
          />
        }
      />

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text, styles.uploadingText]}>{t("Uploading images...")}</Text>
          </View>
        </View>
      )}

      {/* مودال نمایش تصویر */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* دکمه بستن */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close-circle" size={36} color={themeColor4.bgColor(1)} />
            </TouchableOpacity>

            {/* تصویر بزرگ */}
            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                {/* دکمه‌های عملیات */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveImage}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color={themeColor4.bgColor(1)} />
                    ) : (
                      <Ionicons name="download" size={24} color={themeColor4.bgColor(1)} />
                    )}
                    <Text style={[NewStyles.title4]}>
                      {downloading ? t("Saving...") : t("Save to gallery")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButtonModal]}
                    onPress={() => handleDeleteImage(selectedImage.id)}
                  >
                    <Ionicons name="trash" size={24} color={themeColor4.bgColor(1)} />
                    <Text style={[NewStyles.title4]}>{t("Delete")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingBottom: 120
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: themeColor10.bgColor(0.7),
  },
  container: {
    padding: 15,
    paddingBottom: 120,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
    width: '100%',
  },
  uploadButtonContainer: {
    marginBottom: 15,
  },
  uploadButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 12,
    paddingVertical: 14,
    // paddingHorizontal: 20,
    gap: 10,
    ...NewStyles.shadow,
  },
  uploadButtonText: {
    ...NewStyles.text4,
  },
  infoContainer: {
    ...NewStyles.row,
    ...NewStyles.center,
    backgroundColor: themeColor4.bgColor(0.7),
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: themeColor10.bgColor(0.7),
    textAlign: 'center',
  },
  countContainer: {
    ...NewStyles.row,
    ...NewStyles.center,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    padding: 12,
    gap: 10,
    ...NewStyles.shadow,
  },
  countText: {
    fontSize: 16,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  imageCard: {
    width: imageSize,
    height: imageSize,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: themeColor4.bgColor(1),
    ...NewStyles.shadow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: themeColor6.bgColor(0.9),
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...NewStyles.shadow,
  },
  emptyContainer: {
    ...NewStyles.center,
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: themeColor10.bgColor(0.7),
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: themeColor10.bgColor(0.5),
    marginTop: 8,
    textAlign: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    ...NewStyles.shadow,
  },
  uploadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 12,
  },
  modalActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    ...NewStyles.shadow,
  },
  saveButton: {
    backgroundColor: themeColor7.bgColor(1),
  },
  deleteButtonModal: {
    backgroundColor: themeColor6.bgColor(1),
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

