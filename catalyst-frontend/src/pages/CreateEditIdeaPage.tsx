import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';

/**
 * CreateEditIdeaPage Component
 * Form for creating new ideas or editing existing ideas.
 * Features:
 * - Title and description input
 * - Category selection
 * - Preview markdown
 * - Form validation
 * - Submit and cancel buttons
 */
const CreateEditIdeaPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const isEdit = !!ideaId;

  const [formData, setFormData] = useState({
    title: isEdit ? 'Implement dark mode UI' : '',
    description: isEdit
      ? 'Add comprehensive dark mode support...'
      : '',
    category: isEdit ? 'Feature' : '',
  });

  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Feature',
    'Enhancement',
    'Bug Fix',
    'Infrastructure',
    'Documentation',
    'Other',
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isEdit) {
        console.log('Idea updated:', formData);
        alert('Idea updated successfully!');
      } else {
        console.log('Idea created:', formData);
        alert('Idea created successfully!');
      }

      navigate('/ideas');
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <Link to="/ideas">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Idea' : 'Submit a New Idea'}
          </h1>
          <p className="text-gray-600">
            {isEdit
              ? 'Update your idea and share it with the community'
              : 'Share your innovative ideas with the community'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="A concise and descriptive title..."
                value={formData.title}
                onChange={handleChange}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900"
                >
                  Description
                </label>
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {preview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {!preview ? (
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your idea in detail. Include benefits, use cases, and implementation details..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              ) : (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/5000 characters
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">
                Before submitting:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  ✓ Title is clear and descriptive
                </li>
                <li>
                  ✓ Description includes relevant details and use cases
                </li>
                <li>
                  ✓ Category accurately reflects the idea type
                </li>
                <li>
                  ✓ Idea follows community guidelines
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <Link to="/ideas">
                <Button variant="outline" size="md" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Idea' : 'Submit Idea'}
              </Button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              • Be specific - explain what problem your idea solves
            </li>
            <li>
              • Provide context - who would benefit from this idea?
            </li>
            <li>
              • Be realistic - consider feasibility and resources needed
            </li>
            <li>
              • Be respectful - follow our community guidelines
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <Footer
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Security', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'License', href: '#' },
            ],
          },
        ]}
        copyright="© 2025 Catalyst. All rights reserved."
      />
    </div>
  );
};

CreateEditIdeaPage.displayName = 'CreateEditIdeaPage';

export default CreateEditIdeaPage;
