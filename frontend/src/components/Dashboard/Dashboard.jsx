import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI } from '../../services/api';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b-2 border-bronze-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-bronze-600">✨ DocuGen AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-mustard-100 text-mustard-700 rounded-lg">
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-bronze-700 bg-bronze-100 rounded-lg hover:bg-bronze-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-bronze-600">My Projects</h2>
            <p className="mt-1 text-sm text-gray-600">Create and manage your AI-generated documents</p>
          </div>
          <button
            onClick={() => navigate('/create-project')}
            className="px-6 py-3 bg-bronze-500 text-white font-semibold rounded-lg hover:bg-bronze-600 transition shadow-lg flex items-center space-x-2"
          >
            <span>✨</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bronze-500"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-bronze-200">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-600 mb-6">Get started by creating your first AI-powered document</p>
            <button
              onClick={() => navigate('/create-project')}
              className="px-6 py-3 bg-bronze-500 text-white font-semibold rounded-lg hover:bg-bronze-600 transition shadow-lg"
            >
              ✨ Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-bronze-200 hover:border-mustard-500 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-bronze-600 line-clamp-1 group-hover:text-mustard-600 transition">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {project.topic}
                      </p>
                    </div>
                    <span className={`ml-3 px-3 py-1 text-xs font-bold rounded-full ${
                      project.document_type === 'docx' 
                        ? 'bg-bronze-100 text-bronze-700' 
                        : 'bg-mustard-100 text-mustard-700'
                    }`}>
                      {project.document_type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-bronze-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {formatDate(project.created_at)}</span>
                      <span>📝 {project.sections?.length || 0} sections</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;