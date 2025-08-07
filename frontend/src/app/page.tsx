'use client';

import { useState, useEffect } from 'react';
import EmailUploader from '@/components/EmailUploader';
import ResultsDisplay from '@/components/ResultsDisplay';

interface ValidationResult {
  email: string;
  success: boolean;
  configuration?: {
    blacklisted_domains?: string[];
  };
}

export default function Home() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleEmailValidation = async (emails: string[]) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const validationResults: ValidationResult[] = [];
      
      for (const email of emails) {
        try {
          // Call Ruby backend directly
          const formData = new FormData();
          const emailBlob = new Blob([email], { type: 'text/plain' });
          formData.append('file', emailBlob, 'emails.txt');

          const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
          const response = await fetch('https://trueemail-checker.fly.dev/validate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'X-Auth-Token': apiToken,
            },
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            // Handle array response from Ruby server
            if (Array.isArray(result) && result.length > 0) {
              const emailResult = result[0];
              validationResults.push({
                email,
                success: emailResult.success || false,
                configuration: emailResult.configuration || {},
              });
            } else {
              validationResults.push({
                email,
                success: result.success || false,
                configuration: result.configuration || {},
              });
            }
          } else {
            validationResults.push({
              email,
              success: false,
              configuration: {},
            });
          }
        } catch (emailError) {
          validationResults.push({
            email,
            success: false,
            configuration: {},
          });
        }
      }

      setResults(validationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="container mx-auto px-6 sm:px-8 lg:px-10 py-16 lg:py-24 text-center flex items-center justify-center" style={{ marginBottom: 60 }}>
        <div className="max-w-5xl mx-auto">
          <div className="animate-fade-in mb-16" style={{ lineHeight: '5rem' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-light rounded-full mb-10 shadow-lg">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-foreground mb-8 tracking-tight">
              Email Validator
            </h1>
            <p className="text-xl text-secondary max-w-4xl mx-auto leading-relaxed mb-12">
              Validate email addresses with unparalleled accuracy. Upload your list or paste emails directly 
              for comprehensive, real-time validation and detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 text-secondary">
              <div className="flex items-center">
                <svg className="w-7 h-7 mr-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Bulk Processing
              </div>
              <div className="flex items-center">
                <svg className="w-7 h-7 mr-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time Results
              </div>
              <div className="flex items-center">
                <svg className="w-7 h-7 mr-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Export Options
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-4 animate-slide-up mb-16">
            <EmailUploader 
              onValidate={handleEmailValidation} 
              loading={loading}
            />
          </div>

          {error && (
            <div className="bg-error-light border border-error-dark rounded-3xl p-10 sm:p-12 animate-slide-up mb-16">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-9 h-9 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-2xl font-semibold text-error-dark mb-3">Validation Error</h3>
                  <p className="text-error-dark mb-5">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="inline-flex items-center px-7 py-4 text-lg font-medium text-error-dark bg-error-light hover:bg-error-dark hover:text-white rounded-xl transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="glass-effect rounded-3xl p-4 animate-slide-up mb-16">
              <ResultsDisplay results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
