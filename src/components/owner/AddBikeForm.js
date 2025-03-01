'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function AddBikeForm({ onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 5,
    onDrop: acceptedFiles => {
      setImages(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // In a real application, you would upload the images to a storage service
      // and get back URLs to store in the database
      const imageUrls = images.map(image => URL.createObjectURL(image));

      const bikeData = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        type: formData.get('type'),
        year: parseInt(formData.get('year')),
        cc: parseInt(formData.get('cc')),
        hourly_rate: parseFloat(formData.get('hourly_rate')),
        daily_rate: parseFloat(formData.get('daily_rate')),
        location: formData.get('location'),
        description: formData.get('description'),
        images: imageUrls
      };

      const response = await fetch('/api/owner/bikes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bikeData),
      });

      if (!response.ok) {
        throw new Error('Failed to add bike');
      }

      toast.success('Bike added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Bike</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="STANDARD">Standard</option>
                <option value="CRUISER">Cruiser</option>
                <option value="SPORTS">Sports</option>
                <option value="ADVENTURE">Adventure</option>
                <option value="SCOOTER">Scooter</option>
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                required
                min="1990"
                max={new Date().getFullYear()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="cc" className="block text-sm font-medium text-gray-700">
                CC
              </label>
              <input
                type="number"
                id="cc"
                name="cc"
                required
                min="50"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
                Hourly Rate (Rs.)
              </label>
              <input
                type="number"
                id="hourly_rate"
                name="hourly_rate"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="daily_rate" className="block text-sm font-medium text-gray-700">
                Daily Rate (Rs.)
              </label>
              <input
                type="number"
                id="daily_rate"
                name="daily_rate"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            >
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <p className="pl-1">Drag and drop images or click to select files</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {images.map((file) => (
                <div key={file.name} className="relative">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-24 w-full object-cover rounded"
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter(image => image !== file))}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Bike'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
