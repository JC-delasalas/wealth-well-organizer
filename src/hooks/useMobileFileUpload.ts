import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Capacitor imports (will be available after installation)
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { Capacitor } from '@capacitor/core';

interface MobileFileUploadOptions {
  maxSizeBytes?: number;
  quality?: number;
  allowEditing?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

interface CapturedFile {
  file: File;
  dataUrl: string;
  source: 'camera' | 'gallery' | 'file';
}

export const useMobileFileUpload = (options: MobileFileUploadOptions = {}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    quality = 90,
    maxWidth = 1024,
    maxHeight = 1024
  } = options;

  // Check if running on native platform
  const isNativePlatform = () => {
    // Will be available after Capacitor installation
    // return Capacitor.isNativePlatform();
    return false; // Fallback for now
  };

  // Convert data URL to File object
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  // Compress image if needed
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality / 100
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Capture photo using native camera
  const captureFromCamera = async (): Promise<CapturedFile> => {
    if (!isNativePlatform()) {
      throw new Error('Camera not available on web platform');
    }

    setIsCapturing(true);
    
    try {
      // This will work after Capacitor installation
      /*
      const image = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: maxWidth,
        height: maxHeight,
        correctOrientation: true
      });

      if (!image.dataUrl) {
        throw new Error('Failed to capture image');
      }

      const file = dataURLtoFile(image.dataUrl, `receipt-${Date.now()}.jpg`);
      
      return {
        file,
        dataUrl: image.dataUrl,
        source: 'camera'
      };
      */
      
      // Temporary fallback
      throw new Error('Camera functionality requires Capacitor installation');
    } catch (error) {
      console.error('Camera capture failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  };

  // Select from gallery
  const selectFromGallery = async (): Promise<CapturedFile> => {
    if (!isNativePlatform()) {
      throw new Error('Gallery not available on web platform');
    }

    setIsCapturing(true);
    
    try {
      // This will work after Capacitor installation
      /*
      const image = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: maxWidth,
        height: maxHeight
      });

      if (!image.dataUrl) {
        throw new Error('Failed to select image');
      }

      const file = dataURLtoFile(image.dataUrl, `receipt-${Date.now()}.jpg`);
      
      return {
        file,
        dataUrl: image.dataUrl,
        source: 'gallery'
      };
      */
      
      // Temporary fallback
      throw new Error('Gallery functionality requires Capacitor installation');
    } catch (error) {
      console.error('Gallery selection failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  };

  // Web file picker fallback
  const selectFromFiles = (): Promise<CapturedFile> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf,.doc,.docx,.txt';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        // Check file size
        if (file.size > maxSizeBytes) {
          reject(new Error(`File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`));
          return;
        }

        try {
          let processedFile = file;
          
          // Compress image files
          if (file.type.startsWith('image/')) {
            processedFile = await compressImage(file, maxWidth, maxHeight, quality);
          }

          // Create data URL for preview
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              file: processedFile,
              dataUrl: reader.result as string,
              source: 'file'
            });
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(processedFile);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  };

  // Main upload function with source selection
  const uploadFile = async (source?: 'camera' | 'gallery' | 'file'): Promise<CapturedFile> => {
    try {
      if (isNativePlatform()) {
        if (source === 'camera') {
          return await captureFromCamera();
        } else if (source === 'gallery') {
          return await selectFromGallery();
        } else {
          // Show native action sheet to choose source
          // This would be implemented with Capacitor Action Sheet plugin
          return await captureFromCamera(); // Default to camera for now
        }
      } else {
        // Web fallback
        return await selectFromFiles();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploadFile,
    captureFromCamera,
    selectFromGallery,
    selectFromFiles,
    isCapturing,
    isNativePlatform: isNativePlatform()
  };
};
