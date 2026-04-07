import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage, auth, handleFirestoreError, OperationType } from '../firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export type ProgressCallback = (progress: UploadProgress) => void;

export async function uploadAttachment(
  file: File,
  collection: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  const userId    = auth.currentUser?.uid ?? 'anonymous';
  const timestamp = Date.now();
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `uploads/${collection}/${userId}/${timestamp}_${safeName}`;

  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        collection,
        uploadedBy: userId,
        originalName: file.name,
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes:       snapshot.totalBytes,
            percentage:       Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            ),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.UPLOAD, storagePath);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, storagePath);
          reject(error);
        }
      },
    );
  });
}

export async function deleteAttachment(downloadURL: string): Promise<void> {
  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') return;
    handleFirestoreError(error, OperationType.DELETE, downloadURL);
  }
}

export function isStorageUrl(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.startsWith('https://firebasestorage.googleapis.com');
}
