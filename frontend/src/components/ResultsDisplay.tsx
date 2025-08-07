'use client';

import { useState, useMemo } from 'react';

interface ValidationResult {
  email: string;
  success: boolean;
  configuration?: {
    blacklisted_domains?: string[];
  };
}

interface ResultsDisplayProps {
  results: ValidationResult[];
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'invalid' | 'blacklisted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'status'>('email');

  const { validEmails, invalidEmails, blacklistedEmails } = useMemo(() => ({
    validEmails: results.filter(r => r.success),
    invalidEmails: results.filter(r => !r.success),
    blacklistedEmails: results.filter(r => 
      r.configuration?.blacklisted_domains && r.configuration.blacklisted_domains.length > 0
    )
  }), [results]);

  const filteredResults = useMemo(() => {
    let filtered = results;
    
    switch (activeTab) {
      case 'valid':
        filtered = validEmails;
        break;
      case 'invalid':
        filtered = invalidEmails;
        break;
      case 'blacklisted':
        filtered = blacklistedEmails;
        break;
      default:
        filtered = results;
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email);
      }
      return a.success === b.success ? 0 : a.success ? -1 : 1;
    });
  }, [results, activeTab, searchTerm, sortBy, validEmails, invalidEmails, blacklistedEmails]);

  const validPercentage = Math.round((validEmails.length / results.length) * 100);
  const invalidPercentage = Math.round((invalidEmails.length / results.length) * 100);
  const blacklistedPercentage = Math.round((blacklistedEmails.length / results.length) * 100);

  const exportData = (format: 'csv' | 'json' | 'txt') => {
    let content = '';
    const filename = `email-validation-results.${format}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'csv':
        content = `Email,Status,Blacklist Status\n${results.map(r => 
          `${r.email},${r.success ? 'Valid' : 'Invalid'},${
            r.configuration?.blacklisted_domains?.length ? 'Blacklisted' : 'Not Blacklisted'
          }`
        ).join('\n')}`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(results, null, 2);
        mimeType = 'application/json';
        break;
      case 'txt':
        content = `EMAIL VALIDATION RESULTS\n${'='.repeat(30)}\n\nValid Emails (${validEmails.length}):\n${validEmails.map(r => r.email).join('\n')}\n\nInvalid Emails (${invalidEmails.length}):\n${invalidEmails.map(r => r.email).join('\n')}\n\nBlacklisted Emails (${blacklistedEmails.length}):\n${blacklistedEmails.map(r => r.email).join('\n')}`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center py-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Validation Complete
        </h2>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Processed {results.length} emails with detailed analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border-2 border-green-500 rounded-xl p-6 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-700">{validEmails.length}</div>
              <div className="text-sm font-semibold text-green-600">{validPercentage}% of total</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Valid Emails</h3>
          <p className="text-green-600">Successfully verified addresses</p>
        </div>
        
        <div className="bg-card border-2 border-red-500 rounded-xl p-6 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-700">{invalidEmails.length}</div>
              <div className="text-sm font-semibold text-red-600">{invalidPercentage}% of total</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Invalid Emails</h3>
          <p className="text-red-600">Failed verification or malformed</p>
        </div>
        
        <div className="bg-card border-2 border-amber-500 rounded-xl p-6 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-700">{blacklistedEmails.length}</div>
              <div className="text-sm font-semibold text-amber-600">{blacklistedPercentage}% of total</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-amber-800 mb-2">Blacklisted</h3>
          <p className="text-amber-600">From blocked domains</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-card text-foreground"
              />
              <svg className="w-5 h-5 text-secondary absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'email' | 'status')}
              className="px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-card text-foreground"
            >
              <option value="email">Sort by Email</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-muted text-secondary hover:bg-accent'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'valid' ? 'bg-green-500 text-white shadow-md' : 'bg-muted text-secondary hover:bg-accent'
              }`}
            >
              Valid ({validEmails.length})
            </button>
            <button
              onClick={() => setActiveTab('invalid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'invalid' ? 'bg-red-500 text-white shadow-md' : 'bg-muted text-secondary hover:bg-accent'
              }`}
            >
              Invalid ({invalidEmails.length})
            </button>
            {blacklistedEmails.length > 0 && (
              <button
                onClick={() => setActiveTab('blacklisted')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'blacklisted' ? 'bg-amber-500 text-white shadow-md' : 'bg-muted text-secondary hover:bg-accent'
                }`}
              >
                Blacklisted ({blacklistedEmails.length})
              </button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-inner mt-4">
          <div className="max-h-80 overflow-y-auto">
            {filteredResults.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-muted transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.success ? 'bg-green-500' : 
                        result.configuration?.blacklisted_domains?.length ? 'bg-amber-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-foreground">{result.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.success ? 'bg-green-100 text-white-800' : 'bg-red-100 text-white-800'
                      }`}>
                        {result.success ? 'Valid' : 'Invalid'}
                      </span>
                      {result.configuration?.blacklisted_domains?.length && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          Blacklisted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-secondary">No emails match your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-6 border-t border-border">
        <div className="text-secondary text-center sm:text-left">
          Showing {filteredResults.length} of {results.length} emails
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="font-semibold text-foreground">Export as:</span>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <button
              onClick={() => exportData('csv')}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              JSON
            </button>
            <button
              onClick={() => exportData('txt')}
              className="flex items-center px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
