"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { CameraIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface DamageReportProps {
  rentalId: string;
  onSubmit: () => void;
}

export default function DamageReport({ rentalId, onSubmit }: DamageReportProps) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      
      // Generate preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('rentalId', rentalId);
      formData.append('description', description);
      photos.forEach(photo => formData.append('photos', photo));

      const response = await fetch('/api/damage-reports', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit report');

      onSubmit();
    } catch (error) {
      console.error('Error submitting damage report:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('damage.description')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('damage.photos')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Damage photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
            <CameraIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">{t('damage.addPhoto')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? t('common.uploading') : t('damage.submit')}
      </button>
    </form>
  );
}