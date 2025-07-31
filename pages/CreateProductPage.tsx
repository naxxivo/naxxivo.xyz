
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import { MarketCategory, MarketProduct } from '../types';

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
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('market_categories').select('*');
      if (error) {
        console.error("Failed to fetch categories", error);
        setError("Could not load categories. Please try again.");
      } else {
        setCategories((data as MarketCategory[]) || []);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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

    setLoading(true);
    setError(null);

    try {
      const { data: productData, error: productError } = await supabase
        .from('market_products')
        .insert([{
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            category_id: Number(formData.category_id),
            condition: formData.condition,
            location: formData.location
        }] as any)
        .select()
        .single();
        
      if (productError) throw productError;
      
      const newProduct = productData as MarketProduct;
      const images = imageUrls.split('\n').map(url => url.trim()).filter(url => url);
      if(images.length > 0) {
        const imagePayload = images.map(image_url => ({
            product_id: newProduct.id,
            image_url
        }));
        const { error: imageError } = await supabase.from('market_product_images').insert(imagePayload as any);
        if(imageError) {
            console.warn("Product created, but failed to add images:", imageError);
        }
      }

      alert('Product listed successfully!');
      navigate(`/market/product/${newProduct.id}`);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
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
            <Input id="price" label="Price (USD)" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 25.00" required step="0.01" />
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
            <label htmlFor="imageUrls" className="block text-sm font-medium">Image URLs</label>
            <textarea id="imageUrls" rows={4} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner" placeholder="Enter one image URL per line." />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" text={loading ? "Listing..." : "List Product"} disabled={loading} className="w-full" />
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CreateProductPage;
