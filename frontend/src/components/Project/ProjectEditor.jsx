import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, documentAPI } from '../../services/api';

function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingSections, setGeneratingSections] = useState({});
  const [refiningSections, setRefiningSections] = useState({});
  const [refinementPrompts, setRefinementPrompts] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getById(id);
      setProject(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load project');
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    setError('');
    
    try {
      await documentAPI.generateAllContent(id);
      await fetchProject();
      alert('✨ All content generated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleGenerateSection = async (sectionId) => {
    setGeneratingSections({ ...generatingSections, [sectionId]: true });
    setError('');
    
    try {
      const response = await documentAPI.generateSectionContent(sectionId);
      setProject(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.id === sectionId ? { ...s, content: response.data.content } : s
        )
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
    } finally {
      setGeneratingSections({ ...generatingSections, [sectionId]: false });
    }
  };

  const handleRefineSection = async (sectionId) => {
    const prompt = refinementPrompts[sectionId];
    if (!prompt || !prompt.trim()) {
      alert('Please enter refinement instructions');
      return;
    }

    setRefiningSections({ ...refiningSections, [sectionId]: true });
    setError('');
    
    try {
      const response = await documentAPI.refineSectionContent(sectionId, prompt);
      setProject(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.id === sectionId ? { ...s, content: response.data.content } : s
        )
      }));
      setRefinementPrompts({ ...refinementPrompts, [sectionId]: '' });
      alert('✨ Content refined successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to refine content');
    } finally {
      setRefiningSections({ ...refiningSections, [sectionId]: false });
    }
  };

  const handleFeedback = async (sectionId, feedbackType) => {
    try {
      await documentAPI.addFeedback(sectionId, feedbackType);
      alert(`Feedback recorded: ${feedbackType}`);
    } catch (err) {
      console.error('Failed to add feedback:', err);
    }
  };

  const handleAddComment = async (sectionId) => {
    const comment = comments[sectionId];
    if (!comment || !comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      await documentAPI.addFeedback(sectionId, 'comment', comment);
      setComments({ ...comments, [sectionId]: '' });
      setShowCommentBox({ ...showCommentBox, [sectionId]: false });
      alert('💬 Comment saved!');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await documentAPI.exportDocument(id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = project.document_type === 'docx' ? 'docx' : 'pptx';
      link.setAttribute('download', `${project.title}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
      alert('📥 Document exported successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to export document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bronze-500"></div>
          <p className="mt-4 text-bronze-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-bronze-500 text-white rounded-lg hover:bg-bronze-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-bronze-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-bronze-600 hover:text-bronze-700 font-medium"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-bronze-600">{project?.title}</h1>
              <span className={`ml-4 px-3 py-1 text-xs font-bold rounded-full ${
                project?.document_type === 'docx' 
                  ? 'bg-bronze-100 text-bronze-700' 
                  : 'bg-mustard-100 text-mustard-700'
              }`}>
                {project?.document_type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleGenerateAll}
                disabled={generatingAll}
                className="px-4 py-2 text-white bg-mustard-500 rounded-lg hover:bg-mustard-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
              >
                {generatingAll ? '⏳ Generating...' : '⚡ Generate All'}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-white bg-bronze-500 rounded-lg hover:bg-bronze-600 transition font-semibold shadow-lg"
              >
                📥 Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Project Info */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-6 border-2 border-bronze-200">
          <h2 className="text-lg font-bold text-bronze-600 mb-2">📝 Project Topic</h2>
          <p className="text-gray-700">{project?.topic}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {project?.sections && project.sections.length > 0 ? (
            project.sections.map((section, index) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-bronze-200"
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-bronze-50 to-mustard-50 px-6 py-4 border-b-2 border-bronze-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-bronze-600">
                      {index + 1}. {section.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {section.content ? (
                        <>
                          <button
                            onClick={() => handleFeedback(section.id, 'like')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Like"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleFeedback(section.id, 'dislike')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Dislike"
                          >
                            👎
                          </button>
                          <button
                            onClick={() => setShowCommentBox({ 
                              ...showCommentBox, 
                              [section.id]: !showCommentBox[section.id] 
                            })}
                            className="p-2 text-bronze-600 hover:bg-bronze-50 rounded-lg transition"
                            title="Add Comment"
                          >
                            💬
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGenerateSection(section.id)}
                          disabled={generatingSections[section.id]}
                          className="px-4 py-2 text-sm text-white bg-bronze-500 rounded-lg hover:bg-bronze-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow"
                        >
                          {generatingSections[section.id] ? '⏳ Generating...' : '✨ Generate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  {section.content ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">✨</div>
                      <p>No content yet. Click "Generate" to create AI-powered content.</p>
                    </div>
                  )}
                </div>

                {/* Comment Box */}
                {showCommentBox[section.id] && (
                  <div className="px-6 pb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={comments[section.id] || ''}
                        onChange={(e) => setComments({ ...comments, [section.id]: e.target.value })}
                        placeholder="Add your comment..."
                        className="flex-1 px-4 py-2 border-2 border-bronze-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mustard-500"
                      />
                      <button
                        onClick={() => handleAddComment(section.id)}
                        className="px-4 py-2 bg-bronze-500 text-white rounded-lg hover:bg-bronze-600 transition font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowCommentBox({ ...showCommentBox, [section.id]: false })}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Refinement Section */}
                {section.content && (
                  <div className="px-6 pb-6">
                    <div className="bg-mustard-50 rounded-lg p-4 border-2 border-mustard-200">
                      <h4 className="text-sm font-bold text-bronze-600 mb-3">
                        🔧 Refine this content
                      </h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={refinementPrompts[section.id] || ''}
                          onChange={(e) => setRefinementPrompts({ 
                            ...refinementPrompts, 
                            [section.id]: e.target.value 
                          })}
                          placeholder="e.g., Make it more formal, Add bullet points, Shorten it..."
                          className="flex-1 px-4 py-2 border-2 border-bronze-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mustard-500"
                        />
                        <button
                          onClick={() => handleRefineSection(section.id)}
                          disabled={refiningSections[section.id]}className="px-6 py-2 bg-bronze-500 text-white rounded-lg hover:bg-bronze-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold"
                    >
                      {refiningSections[section.id] ? 'Refining...' : 'Refine'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    💡 Tell AI how to improve: "Make it shorter", "Add more details", "Convert to bullets"
                  </p>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500 border-2 border-bronze-200">
          No sections found
        </div>
      )}
    </div>
  </div>
</div>
  );
}
export default ProjectEditor;