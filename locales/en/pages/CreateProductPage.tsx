import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import Input from '@/components/ui/Input';
import { MarketCategory, MarketProductInsert, MarketProductImageInsert } from '@/types';
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/solid';

const CreateProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: 'Used - Good',
    location: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('market_categories').select('*');
      if (error) {
        console.error("Failed to fetch categories", error);
        setError("Could not load categories. Please try again.");
      } else {
        setCategories((data as unknown as MarketCategory[]) || []);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]); // Clean up memory
    setImageFiles(files => files.filter((_, i) => i !== index));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to list a product.');
      return;
    }
    if (!formData.title || !formData.price || !formData.category_id) {
        setError('Title, price, and category are required.');
        return;
    }
    if (imageFiles.length === 0) {
        setError('At least one image is required.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const productPayload: MarketProductInsert = {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category_id: Number(formData.category_id),
          condition: formData.condition,
          location: formData.location
      };

      const { data: productData, error: productError } = await supabase
        .from('market_products')
        .insert(productPayload)
        .select()
        .single();
        
      if (productError) throw productError;
      if (!productData) throw new Error("Product creation failed silently.");

      const uploadedImagePaths: string[] = [];
      for (const file of imageFiles) {
        const filePath = `${user.id}/${productData.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(filePath, file);

        if (uploadError) {
            console.warn(`Failed to upload ${file.name}:`, uploadError);
            continue; // Skip failed uploads but continue with others
        }
        uploadedImagePaths.push(filePath);
      }

      if (uploadedImagePaths.length > 0) {
        const imagePayload: MarketProductImageInsert[] = uploadedImagePaths.map(image_path => ({
            product_id: productData.id,
            image_path
        }));
        const { error: imageError } = await supabase.from('market_product_images').insert(imagePayload);
        if (imageError) throw imageError;
      } else if (imageFiles.length > 0) {
          throw new Error("Product was created, but all image uploads failed. Please edit the listing to add images.");
      }

      alert('Product listed successfully!');
      navigate(`/market/product/${productData.id}`);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating the product.');
      console.error(err);
    } finally {
      setLoading(false);
      imagePreviews.forEach(url => URL.revokeObjectURL(url)); // Final cleanup
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-primary-blue/20">
        <h1 className="font-display text-4xl font-bold text-center from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-8">
          List a New Item
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="title" label="Title" type="text" value={formData.title} onChange={handleInputChange} placeholder="What are you selling?" required />
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea id="description" rows={4} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner" placeholder="Describe your item in detail..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="price" label="Price (USD)" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 25.00" required step="0.01" min="0" />
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium mb-1">Category</label>
              <select id="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner">
                <option value="" disabled>Select a category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium mb-1">Condition</label>
              <select id="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner">
                <option>New</option>
                <option>Used - Like New</option>
                <option>Used - Good</option>
                <option>Used - Fair</option>
              </select>
            </div>
             <Input id="location" label="Location" type="text" value={formData.location} onChange={handleInputChange} placeholder="e.g., Tokyo, Japan" />
          </div>
          <div>
            <label className="block text-sm font-medium">Images</label>
             <div className="mt-2 flex justify-center rounded-lg border border-dashed border-primary-blue/50 px-6 py-10">
                <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-secondary-purple/50" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-secondary-purple/80">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white dark:bg-dark-card font-semibold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 dark:focus-within:ring-offset-dark-card hover:text-secondary-coral">
                            <span>Upload files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-secondary-purple/60">PNG, JPG, GIF up to 10MB</p>
                </div>
            </div>
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img src={preview} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <XCircleIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Listing..." : "List Product"}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CreateProductPage;