import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pb } from '../services/pocketbase';
import { Spinner } from '../components/Spinner';

export const CreatePostPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Invalidate video if user selects an image
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      // Create a URL for previewing the video
      setVideoPreview(URL.createObjectURL(file));
      // Invalidate image if user selects a video
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || (!description && !imageFile && !videoFile)) {
        setError('A post must have a description or an image/video.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('user', authUser.id);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (videoFile) {
        formData.append('video', videoFile);
      }
      
      const newPost = await pb.collection('posts').create(formData, { requestKey: null });
      
      navigate(`/posts/${newPost.id}`);

    } catch (err: any) {
      console.error("Post creation failed:", err);
      setError(err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="max-w-3xl mx-auto">
        <div className="bg-surface rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Create a New Post</h1>

          {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea 
                id="description" 
                rows={5} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="What's on your mind?" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Media (Image or Video)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                    <div className="space-y-2 text-center">
                        {imagePreview && (
                            <img src={imagePreview} alt="Image preview" className="max-h-60 mx-auto rounded-md"/>
                        )}
                        {videoPreview && (
                             <video src={videoPreview} controls className="max-h-60 mx-auto rounded-md"></video>
                        )}
                        {!imagePreview && !videoPreview && (
                            <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L16 20m12-12v8m0 4v.01M12 28h24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        <div className="flex text-sm justify-center space-x-4">
                            <label htmlFor="image-upload" className="relative cursor-pointer bg-secondary px-3 py-1 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                <span>{imageFile ? 'Change Image' : 'Upload Image'}</span>
                                <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                            </label>
                             <label htmlFor="video-upload" className="relative cursor-pointer bg-secondary px-3 py-1 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                <span>{videoFile ? 'Change Video' : 'Upload Video'}</span>
                                <input id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleVideoChange} />
                            </label>
                        </div>
                        <p className="text-xs text-text-secondary">PNG, JPG, MP4, etc. up to 10MB</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-opacity-50 flex items-center">
                    {loading ? <><Spinner size="sm" /> <span className="ml-2">Posting...</span></> : 'Create Post'}
                </button>
            </div>
          </form>
        </div>
      </main>
  );
};