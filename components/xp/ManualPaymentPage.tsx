import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import { BackArrowIcon, UploadIcon } from '../common/AppIcons';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

interface ManualPaymentPageProps {
    onBack: () => void;
    session: Session;
    productId: number;
    onSubmit: () => void;
}

type Product = Tables<'products'>;

const ManualPaymentPage: React.FC<ManualPaymentPageProps> = ({ onBack, session, productId, onSubmit }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [senderDetails, setSenderDetails] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError("No product selected.");
                setLoading(false);
                return;
            }
            const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
            if (error) {
                setError("Could not load product details.");
                console.error(error);
            } else {
                setProduct(data);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!senderDetails.trim() || !screenshotFile || !product) {
            setError('Please fill all fields and upload a screenshot.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Upload screenshot
            const fileName = `${session.user.id}-${Date.now()}-${screenshotFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('payments')
                .upload(fileName, screenshotFile);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('payments').getPublicUrl(fileName);

            // 2. Insert payment record
            const paymentRecord: TablesInsert<'manual_payments'> = {
                user_id: session.user.id,
                product_id: product.id,
                amount: product.price,
                sender_details: senderDetails,
                screenshot_url: publicUrl,
                status: 'pending'
            };

            const { error: insertError } = await supabase.from('manual_payments').insert([paymentRecord]);
            if (insertError) throw insertError;

            alert('Your payment submission has been received! It will be reviewed shortly.');
            onSubmit();

        } catch (err: any) {
            setError(err.message || 'An error occurred during submission.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-500 pt-20">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Manual Payment</h1>
                <div className="w-6"></div> {/* Placeholder */}
            </header>
            <main className="p-4 space-y-6">
                <div className="bg-white p-5 rounded-lg shadow-sm">
                    <h2 className="font-bold text-lg text-gray-800">Instructions</h2>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 mt-2">
                        <li>Send exactly <strong className="text-violet-600">${product?.price.toFixed(2)} USD</strong> to our Binance Pay ID.</li>
                        <li>Binance Pay ID: <strong className="text-gray-900 bg-gray-100 px-2 py-1 rounded">275487926</strong></li>
                        <li>Take a screenshot of the successful transaction confirmation.</li>
                        <li>Fill out the form below and upload your screenshot.</li>
                        <li>Your package will be credited after manual review (usually within 1-2 hours).</li>
                    </ol>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-semibold text-center">Submitting for: <span className="text-violet-600">{product?.name}</span></h3>
                    
                    <Input 
                        id="senderDetails" 
                        label="Your Binance Pay ID / Email / Phone" 
                        value={senderDetails}
                        onChange={e => setSenderDetails(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot</label>
                        {screenshotPreview ? (
                            <div className="mt-2 text-center">
                                <img src={screenshotPreview} alt="Screenshot preview" className="max-w-full max-h-48 mx-auto rounded-md shadow-sm" />
                                <button type="button" onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }} className="text-xs text-red-500 mt-2 hover:underline">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-1 flex justify-center w-full px-6 py-10 border-2 border-gray-300 border-dashed rounded-md"
                                disabled={isSubmitting}
                            >
                                <div className="space-y-1 text-center">
                                    <UploadIcon />
                                    <p className="text-sm text-gray-600">Click to upload</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <LoadingSpinner/> : 'Submit for Review'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ManualPaymentPage;
