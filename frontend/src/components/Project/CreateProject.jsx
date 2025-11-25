import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';

function CreateProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [topic, setTopic] = useState('');
  const [sections, setSections] = useState(['']);

  const handleAddSection = () => {
    setSections([...sections, '']);
  };

  const handleRemoveSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleSectionChange = (index, value) => {
    const newSections = [...sections];
    newSections[index] = value;
    setSections(newSections);
  };

  const handleNext = () => {
    if (step === 1 && !documentType) {
      setError('Please select a document type');
      return;
    }
    if (step === 2 && (!title || !topic)) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Validate sections
    const validSections = sections.filter(s => s.trim() !== '');
    if (validSections.length === 0) {
      setError('Please add at least one section');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const projectData = {
        title,
        document_type: documentType,
        topic,
        structure: {
          sections: validSections
        }
      };

      const response = await projectAPI.create(projectData);
      navigate(`/project/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-bronze-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-bronze-600 hover:text-bronze-700 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-bronze-600">✨ Create New Project</h1>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b-2 border-bronze-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Step 1 */}
              <div className={`flex items-center ${step >= 1 ? 'text-bronze-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? 'bg-bronze-500 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-3 font-semibold">Document Type</span>
              </div>
              
              {/* Connector */}
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-bronze-500' : 'bg-gray-200'}`}></div>
              
              {/* Step 2 */}
              <div className={`flex items-center ${step >= 2 ? 'text-bronze-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? 'bg-bronze-500 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-3 font-semibold">Details</span>
              </div>
              
              {/* Connector */}
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-bronze-500' : 'bg-gray-200'}`}></div>
              
              {/* Step 3 */}
              <div className={`flex items-center ${step >= 3 ? 'text-bronze-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 3 ? 'bg-bronze-500 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-3 font-semibold">Structure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-bronze-200">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Document Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-bronze-600 mb-2">Choose Document Type</h2>
              <p className="text-gray-600 mb-8">Select the type of document you want to create</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setDocumentType('docx')}
                  className={`p-8 border-3 rounded-2xl text-left transition ${
                    documentType === 'docx'
                      ? 'border-mustard-500 bg-mustard-50 shadow-lg'
                      : 'border-bronze-200 hover:border-bronze-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="text-4xl mr-4">📄</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-bronze-600 mb-2">
                        Microsoft Word
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create structured documents with sections, paragraphs, and formatted text
                      </p>
                    </div>
                    {documentType === 'docx' && (
                      <svg className="w-6 h-6 text-mustard-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setDocumentType('pptx')}
                  className={`p-8 border-3 rounded-2xl text-left transition ${
                    documentType === 'pptx'
                      ? 'border-mustard-500 bg-mustard-50 shadow-lg'
                      : 'border-bronze-200 hover:border-bronze-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="text-4xl mr-4">📊</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-bronze-600 mb-2">
                        PowerPoint
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create presentations with slides, titles, and bullet points
                      </p>
                    </div>
                    {documentType === 'pptx' && (
                      <svg className="w-6 h-6 text-mustard-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!documentType}
                  className="px-8 py-3 bg-bronze-500 text-white font-semibold rounded-lg hover:bg-bronze-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Topic & Title */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-bronze-600 mb-2">Project Details</h2>
              <p className="text-gray-600 mb-8">Provide information about your document</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q4 Business Report"
                    className="w-full px-4 py-3 border-2 border-bronze-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Main Topic / Prompt
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., A comprehensive analysis of market trends in the electric vehicle industry"
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-bronze-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent transition"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    💡 This will guide the AI in generating relevant content
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 text-bronze-700 bg-bronze-100 font-semibold rounded-lg hover:bg-bronze-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!title || !topic}
                  className="px-8 py-3 bg-bronze-500 text-white font-semibold rounded-lg hover:bg-bronze-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Structure */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-bronze-600 mb-2">
                Define {documentType === 'docx' ? 'Sections' : 'Slides'}
              </h2>
              <p className="text-gray-600 mb-8">
                Add {documentType === 'docx' ? 'section headings' : 'slide titles'} for your document
              </p>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-bronze-600 font-bold text-lg w-8">{index + 1}.</span>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => handleSectionChange(index, e.target.value)}
                      placeholder={documentType === 'docx' ? 'Section title' : 'Slide title'}
                      className="flex-1 px-4 py-3 border-2 border-bronze-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent transition"
                    />
                    {sections.length > 1 && (
                      <button
                        onClick={() => handleRemoveSection(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSection}
                className="mt-6 px-6 py-3 text-bronze-600 border-2 border-bronze-500 font-semibold rounded-lg hover:bg-bronze-50 transition"
              >
                + Add {documentType === 'docx' ? 'Section' : 'Slide'}
              </button>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 text-bronze-700 bg-bronze-100 font-semibold rounded-lg hover:bg-bronze-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-bronze-500 text-white font-semibold rounded-lg hover:bg-bronze-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Creating...' : '✨ Create Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateProject;