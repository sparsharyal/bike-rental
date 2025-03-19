import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          common: {
            loading: 'Loading...',
            error: 'An error occurred',
            success: 'Success!',
            confirm: 'Confirm',
            cancel: 'Cancel',
            back: 'Back',
            save: 'Save',
          },
          auth: {
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            email: 'Email',
            password: 'Password',
          },
          bikes: {
            available: 'Available',
            unavailable: 'Unavailable',
            rentNow: 'Rent Now',
            pricePerDay: 'Price per day',
            location: 'Location',
          },
          payment: {
            secure: 'Secure Payment Gateway',
            encrypted: 'End-to-End Encrypted',
            processing: 'Processing payment...',
            success: 'Payment successful!',
            failed: 'Payment failed',
            validationFailed: 'Payment validation failed',
            initiationFailed: 'Failed to initiate payment',
            khalti: 'Pay with Khalti',
            khaltiDesc: 'Fast and secure digital wallet',
            esewa: 'Pay with eSewa',
            esewaDesc: 'Quick and reliable payments',
            fraudDetected: 'Suspicious activity detected',
            sessionExpired: 'Payment session expired',
            amountMismatch: 'Payment amount mismatch',
          },
          identity: {
            documents: 'Identity Documents',
            uploadDocument: 'Upload Document',
            emailVerification: 'Email Verification',
            emailInstructions: 'Please verify your email address',
            sendVerificationEmail: 'Send Verification Email',
            id_card: 'ID Card',
            driving_license: 'Driving License',
            passport: 'Passport',
            verificationSuccess: 'Document verified successfully',
            verificationFailed: 'Document verification failed',
          },
          pricing: {
            baseFare: 'Base Fare',
            demandSurge: 'Demand Surge',
            locationFactor: 'Location Factor',
            totalFare: 'Total Fare',
            priceBreakdown: 'Price Breakdown',
          },
          rental: {
            active: 'Active Rentals',
            history: 'Rental History',
            start: 'Start Date',
            end: 'End Date',
            status: 'Status',
          },
        },
      },
      ne: {
        translation: {
          common: {
            loading: 'लोड हुँदैछ...',
            error: 'त्रुटि भयो',
            success: 'सफल!',
            confirm: 'पुष्टि गर्नुहोस्',
            cancel: 'रद्द गर्नुहोस्',
            back: 'पछाडि',
            save: 'सुरक्षित गर्नुहोस्',
          },
          auth: {
            login: 'लग इन',
            register: 'दर्ता गर्नुहोस्',
            logout: 'लग आउट',
            email: 'इमेल',
            password: 'पासवर्ड',
          },
          bikes: {
            available: 'उपलब्ध',
            unavailable: 'अनुपलब्ध',
            rentNow: 'भाडामा लिनुहोस्',
            pricePerDay: 'प्रति दिन मूल्य',
            location: 'स्थान',
          },
          payment: {
            secure: 'सुरक्षित भुक्तानी गेटवे',
            encrypted: 'एन्ड-टु-एन्ड इन्क्रिप्टेड',
            processing: 'भुक्तानी प्रक्रिया हुँदैछ...',
            success: 'भुक्तानी सफल!',
            failed: 'भुक्तानी असफल',
            validationFailed: 'भुक्तानी प्रमाणीकरण असफल',
            initiationFailed: 'भुक्तानी सुरु गर्न असफल',
            khalti: 'खल्तीबाट भुक्तानी गर्नुहोस्',
            khaltiDesc: 'छिटो र सुरक्षित डिजिटल वालेट',
            esewa: 'ई-सेवाबाट भुक्तानी गर्नुहोस्',
            esewaDesc: 'छिटो र भरपर्दो भुक्तानी',
            fraudDetected: 'शंकास्पद गतिविधि पत्ता लाग्यो',
            sessionExpired: 'भुक्तानी सत्र समाप्त भयो',
            amountMismatch: 'भुक्तानी रकम मेल खाएन',
          },
          identity: {
            documents: 'पहिचान कागजातहरू',
            uploadDocument: 'कागजात अपलोड गर्नुहोस्',
            emailVerification: 'इमेल प्रमाणीकरण',
            emailInstructions: 'कृपया आफ्नो इमेल ठेगाना प्रमाणित गर्नुहोस्',
            sendVerificationEmail: 'प्रमाणीकरण इमेल पठाउनुहोस्',
            id_card: 'परिचय पत्र',
            driving_license: 'सवारी चालक अनुमतिपत्र',
            passport: 'राहदानी',
            verificationSuccess: 'कागजात प्रमाणित सफल',
            verificationFailed: 'कागजात प्रमाणीकरण असफल',
          },
          pricing: {
            baseFare: 'आधार भाडा',
            demandSurge: 'माग वृद्धि',
            locationFactor: 'स्थान कारक',
            totalFare: 'कुल भाडा',
            priceBreakdown: 'मूल्य विवरण',
          },
          rental: {
            active: 'सक्रिय भाडाहरू',
            history: 'भाडा इतिहास',
            start: 'सुरु मिति',
            end: 'अन्त्य मिति',
            status: 'स्थिति',
          },
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;