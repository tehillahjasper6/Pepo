'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PepoBee } from '@/components/PepoBee';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { apiClient } from '@/lib/apiClient';

type FormData = {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPolicy: boolean;

  // Step 2: Organization
  organizationName: string;
  organizationType: string;
  country: string;
  city: string;
  address: string;
  yearEstablished: string;
  registrationNumber: string;
  taxExemptionId: string;
  website: string;
  officialEmail: string;
  officialPhone: string;

  // Step 3: Contact
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  contactNationalId: string;

  // Step 4: Documents
  registrationCertificate: File | null;
  taxExemptionDoc: File | null;
  contactNationalIdDoc: File | null;
};

export default function NGORegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPolicy: false,
    organizationName: '',
    organizationType: '',
    country: '',
    city: '',
    address: '',
    yearEstablished: '',
    registrationNumber: '',
    taxExemptionId: '',
    website: '',
    officialEmail: '',
    officialPhone: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    contactNationalId: '',
    registrationCertificate: null,
    taxExemptionDoc: null,
    contactNationalIdDoc: null,
  });

  const totalSteps = 4;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF or image files only');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData({ ...formData, [field]: file });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return false;
        }
        if (!formData.acceptTerms || !formData.acceptPolicy) {
          toast.error('Please accept the terms and policy');
          return false;
        }
        return true;

      case 2:
        if (
          !formData.organizationName ||
          !formData.organizationType ||
          !formData.country ||
          !formData.city ||
          !formData.address ||
          !formData.registrationNumber ||
          !formData.officialEmail ||
          !formData.officialPhone
        ) {
          toast.error('Please fill in all required organization fields');
          return false;
        }
        return true;

      case 3:
        if (
          !formData.contactName ||
          !formData.contactRole ||
          !formData.contactEmail ||
          !formData.contactPhone
        ) {
          toast.error('Please fill in all required contact fields');
          return false;
        }
        return true;

      case 4:
        if (!formData.registrationCertificate) {
          toast.error('Please upload registration certificate');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);

    try {
      // Upload documents first
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof FormData];
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Call NGO registration API
      await apiClient.registerNGO(formDataToSend);

      toast.success('Application submitted successfully! Your application is under review.');
      router.push('/ngo/status');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit application';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <PepoBee emotion="idle" size={120} />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">NGO Registration</h1>
          <p className="text-gray-600 mt-2">
            Join PEPO as a verified organization and start making an impact
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Account</span>
            <span>Organization</span>
            <span>Contact</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="card">
          {currentStep === 1 && (
            <Step1Account formData={formData} handleInputChange={handleInputChange} />
          )}
          {currentStep === 2 && (
            <Step2Organization formData={formData} handleInputChange={handleInputChange} />
          )}
          {currentStep === 3 && (
            <Step3Contact formData={formData} handleInputChange={handleInputChange} />
          )}
          {currentStep === 4 && (
            <Step4Documents formData={formData} handleFileChange={handleFileChange} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Your application will be reviewed by our team. You&#39;ll receive
            a notification once your organization is verified. This process typically takes 2-3
            business days.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 1: Account Information
function Step1Account({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Account Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="official@organization.org"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="space-y-3 mt-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            className="mt-1 mr-3"
            required
          />
          <span className="text-sm text-gray-700">
            I accept the <a href="/terms" className="text-primary-600 underline">Terms of Service</a> *
          </span>
        </label>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="acceptPolicy"
            checked={formData.acceptPolicy}
            onChange={handleInputChange}
            className="mt-1 mr-3"
            required
          />
          <span className="text-sm text-gray-700">
            I accept the <a href="/privacy" className="text-primary-600 underline">Transparency & Ethical Use Policy</a> *
          </span>
        </label>
      </div>
    </div>
  );
}

// Step 2: Organization Details
function Step2Organization({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Organization Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Legal Name *
        </label>
        <input
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Type *
        </label>
        <select
          name="organizationType"
          value={formData.organizationType}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select type</option>
          <option value="NGO">NGO</option>
          <option value="CHARITY">Charity</option>
          <option value="FOUNDATION">Foundation</option>
          <option value="FAITH_BASED">Faith-based Organization</option>
          <option value="COMMUNITY_ORG">Community Organization</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City / Region *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Official Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Established
          </label>
          <input
            type="number"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Number *
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Government/Registry ID"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Exemption ID (if applicable)
        </label>
        <input
          type="text"
          name="taxExemptionId"
          value={formData.taxExemptionId}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="https://example.org"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Official Email *
          </label>
          <input
            type="email"
            name="officialEmail"
            value={formData.officialEmail}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Official Phone *
          </label>
          <input
            type="tel"
            name="officialPhone"
            value={formData.officialPhone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+1234567890"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Primary Contact
function Step3Contact({
  formData,
  handleInputChange,
}: {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Primary Contact Person</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="contactName"
          value={formData.contactName}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role / Title *
        </label>
        <input
          type="text"
          name="contactRole"
          value={formData.contactRole}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Executive Director"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+1234567890"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          National ID / Passport Number
        </label>
        <input
          type="text"
          name="contactNationalId"
          value={formData.contactNationalId}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}

// Step 4: Documents
function Step4Documents({
  formData,
  handleFileChange,
}: {
  formData: FormData;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Required Documents</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Registration Certificate * (PDF or Image)
        </label>
        <FileUpload
          field="registrationCertificate"
          file={formData.registrationCertificate}
          handleFileChange={handleFileChange}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload your official registration certificate from government/registry
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Exemption Document (if applicable)
        </label>
        <FileUpload
          field="taxExemptionDoc"
          file={formData.taxExemptionDoc}
          handleFileChange={handleFileChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Person National ID / Passport
        </label>
        <FileUpload
          field="contactNationalIdDoc"
          file={formData.contactNationalIdDoc}
          handleFileChange={handleFileChange}
        />
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Important:</strong> All documents must be clear and legible. Maximum file size:
          5MB per document. Accepted formats: PDF, JPEG, PNG.
        </p>
      </div>
    </div>
  );
}

function FileUpload({
  field,
  file,
  handleFileChange,
  required,
}: {
  field: string;
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          {file ? (
            <div>
              <p className="text-primary-600 font-medium">✓ {file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">PDF, JPEG, PNG (max 5MB)</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(e, field)}
          className="hidden"
          required={required}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => handleFileChange({ target: { files: null } } as unknown as React.ChangeEvent<HTMLInputElement>, field)}
          className="text-sm text-red-600 mt-2"
        >
          Remove file
        </button>
      )}
    </div>
  );
}



