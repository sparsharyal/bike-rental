"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface IdentityVerificationProps {
  userId: string;
  onVerificationComplete: (status: 'APPROVED' | 'REJECTED') => void;
}

interface Document {
  type: 'ID_CARD' | 'DRIVING_LICENSE' | 'PASSPORT';
  file: File;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export default function IdentityVerification({
  userId,
  onVerificationComplete,
}: IdentityVerificationProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: Document['type']) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUploading(true);

      try {
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
          throw new Error(t('identity.invalidFileType'));
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(t('identity.fileTooLarge'));
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('documentType', type);

        const response = await fetch('/api/identity/verify-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(t('identity.verificationFailed'));
        }

        const result = await response.json();
        setDocuments(prev => [
          ...prev,
          { type, file, status: result.verified ? 'VERIFIED' : 'PENDING' }
        ]);

        if (result.verified) {
          checkVerificationStatus();
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        onVerificationComplete('REJECTED');
      } finally {
        setUploading(false);
      }
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/identity/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(t('identity.emailSendFailed'));
      }

      // Start polling for email verification status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/identity/check-email-verification?userId=${userId}`);
        const { verified } = await statusResponse.json();
        
        if (verified) {
          setEmailVerified(true);
          clearInterval(pollInterval);
          checkVerificationStatus();
        }
      }, 5000); // Check every 5 seconds

      // Clear interval after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  const checkVerificationStatus = () => {
    const allDocumentsVerified = documents.every(doc => doc.status === 'VERIFIED');
    const requiredDocuments = ['ID_CARD', 'DRIVING_LICENSE', 'PASSPORT'].some(
      type => documents.find(doc => doc.type === type && doc.status === 'VERIFIED')
    );
    
    if (allDocumentsVerified && emailVerified && requiredDocuments) {
      onVerificationComplete('APPROVED');
    } else if (documents.some(doc => doc.status === 'REJECTED')) {
      onVerificationComplete('REJECTED');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('identity.documents')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['ID_CARD', 'DRIVING_LICENSE', 'PASSPORT'].map((type) => (
            <div key={type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
                {documents.find(doc => doc.type === type)?.status === 'VERIFIED' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-sm font-medium mb-2">{t(`identity.${type.toLowerCase()}`)}</p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleDocumentUpload(e, type as Document['type'])}
                className="hidden"
                id={`document-${type}`}
              />
              <label
                htmlFor={`document-${type}`}
                className="block text-center text-sm text-blue-500 hover:text-blue-600 cursor-pointer"
              >
                {t('identity.uploadDocument')}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t('identity.emailVerification')}</h3>
            <p className="text-sm text-gray-500">{t('identity.emailInstructions')}</p>
          </div>
          {emailVerified ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <button
              onClick={sendVerificationEmail}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              {t('identity.sendVerificationEmail')}
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          {t('common.uploading')}
        </div>
      )}
    </div>
  );
}