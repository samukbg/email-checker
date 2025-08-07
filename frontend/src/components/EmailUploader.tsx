'use client';

import { useState, useRef, useCallback } from 'react';

interface EmailUploaderProps {
  onValidate: (emails: string[]) => void;
  loading: boolean;
}

export default function EmailUploader({ onValidate, loading }: EmailUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [emails, setEmails] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [validEmails, setValidEmails] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const processEmails = useCallback((text: string) => {
    const emailList = text
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    const valid = emailList.filter(validateEmail);
    
    setEmailCount(emailList.length);
    setValidEmails(valid.length);
    setShowPreview(emailList.length > 0);
    
    return emailList;
  }, [validateEmail]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setEmails(text);
      processEmails(text);
    };
    reader.readAsText(file);
  };

  const handleEmailsChange = (text: string) => {
    setEmails(text);
    processEmails(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailList = processEmails(emails);
    
    if (emailList.length > 0) {
      onValidate(emailList);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-8">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary-light scale-[1.02] shadow-lg'
              : 'border-border hover:border-primary-light hover:bg-muted'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="space-y-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              dragActive ? 'bg-primary-light text-primary scale-110' : 'bg-accent text-secondary'
            }`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                {dragActive ? 'Drop your file here' : 'Upload your email list'}
              </h3>
              <p className="text-base sm:text-lg text-secondary">
                Drop your email list file here, or browse files
              </p>
              <div className="flex items-center justify-center text-sm text-secondary">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  .txt, .csv supported
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label htmlFor="emails" className="text-xl font-semibold text-foreground">
              Or paste emails directly
            </label>
            {showPreview && (
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center text-secondary bg-accent px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {emailCount} emails
                </span>
                <span className={`flex items-center px-3 py-1 rounded-full ${validEmails === emailCount ? 'text-success-dark bg-success-light' : 'text-warning-dark bg-warning-light'}`}>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {validEmails} valid format
                </span>
              </div>
            )}
          </div>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => handleEmailsChange(e.target.value)}
            className="w-full h-40 p-4 border-2 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 resize-none bg-card text-foreground placeholder-secondary"
            placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com&#10;&#10;Paste your email list here, one email per line..."
          />
          {emailCount > validEmails && (
            <div className="p-3 bg-warning-light border border-warning-dark rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-warning-dark mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-warning-dark mb-1">
                    {emailCount - validEmails} emails have invalid format
                  </p>
                  <p className="text-sm text-warning-dark">
                    Please check the format (example: user@domain.com)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-6">
        {showPreview && (
          <div className="text-center">
            <p className="text-lg text-secondary mb-2">
              Ready to validate <span className="font-semibold text-foreground">{validEmails}</span> emails
            </p>
            {emailCount > validEmails && (
              <p className="text-sm text-warning-dark">
                {emailCount - validEmails} emails will be skipped due to invalid format
              </p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || !emails.trim() || validEmails === 0}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
            loading || !emails.trim() || validEmails === 0
              ? 'bg-muted text-secondary cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Validating {emailCount} emails...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validate {validEmails > 0 ? validEmails : ''} Emails
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
