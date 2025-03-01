'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function ReportIssue({ params }) {
  const router = useRouter();
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
      const description = formData.get('description');
      const severity = formData.get('severity');

      // In a real application, you would upload the images to a storage service
      // and get back URLs to store in the database
      const imageUrls = images.map(image => URL.createObjectURL(image));

      const response = await fetch(`/api/rentals/${params.id}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          severity,
          images: imageUrls
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit issue report');
      }

      toast.success('Issue reported successfully');
      router.push('/customer/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="LOW">Low - Minor issue, bike is still usable</option>
              <option value="MEDIUM">Medium - Issue affects bike performance</option>
              <option value="HIGH">High - Bike is not safe to use</option>
            </select>
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
            <div className="grid grid-cols-2 gap-4 mt-4">
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
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
