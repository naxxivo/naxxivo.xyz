import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, TablesInsert, Json } from '../../integrations/supabase/types';
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

interface PaymentInstructions {
    binance_pay_id: string;
    recipient_name: string;
    network: string;
    currency: string;
}

const ManualPaymentPage: React.FC<ManualPaymentPageProps> = ({ onBack, session, productId, onSubmit }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
    const [senderDetails, setSenderDetails] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!productId) {
                setError("No product selected.");
                setLoading(false);
                return;
            }
            try {
                const [productResponse, settingsResponse] = await Promise.all([
                    supabase.from('products').select('*').eq('id', productId).single(),
                    supabase.from('app_settings').select('value').eq('key', 'payment_instructions').single()
                ]);
                
                const { data: productData, error: productError } = productResponse;
                if (productError) throw productError;
                setProduct(productData as any);

                const { data: settingsData, error: settingsError } = settingsResponse;
                if (settingsError) throw new Error("Could not load payment instructions.");
                setInstructions(settingsData?.value as PaymentInstructions | null);

            } catch (err: any) {
                setError(err.message || 'Failed to load payment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!senderDetails.trim() || !screenshotFile || !product) {
            setError("Please fill in all details and upload a screenshot.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Upload screenshot
            const fileName = `${session.user.id}-${Date.now()}-${screenshotFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(fileName, screenshotFile);
            
            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(fileName);

            // 3. Create payment record
            const newPayment: TablesInsert<'manual_payments'> = {
                user_id: session.user.id,
                product_id: product.id,
                amount: product.price,
                sender_details: senderDetails,
                screenshot_url: publicUrl,
                status: 'pending'
            };

            const { error: insertError } = await supabase.from('manual_payments').insert([newPayment] as any);
            if (insertError) throw insertError;
            
            alert('Your payment has been submitted for review. It may take up to 24 hours to process.');
            onSubmit();

        } catch(err: any) {
            setError(err.message || 'Failed to submit payment.');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    if (error) return <div className="p-4 text-center text-red-500">{error} <Button onClick={onBack} className="mt-4 mx-auto w-auto">Go Back</Button></div>;
    if (!product || !instructions) return <div className="p-4 text-center">Payment details not available.</div>;

    return (
        <div className="min-h-screen bg-[#DAF1DE] dark:bg-[#0A1916]">
            <header className="flex items-center p-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#102A27] sticky top-0 z-10">
                <button onClick={onBack} className="text-[#235347] dark:text-[#8EB69B] hover:text-[#0E2B26] dark:hover:text-white"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[#333333] dark:text-[#E0F0E9] mx-auto">Manual Payment</h1>
                <div className="w-6"></div>
            </header>

            <main className="p-4 space-y-6">
                <div className="bg-white dark:bg-[#102A27] p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-center text-[#333333] dark:text-[#E0F0E9]">Pay <span className="text-[#16A832]">${product.price.toFixed(2)}</span> for {product.name}</h2>
                    <div className="mt-4 text-sm text-center text-[#235347] dark:text-[#8EB69B]">
                        <p>Please send the exact amount to the following address and submit your transaction proof below.</p>
                    </div>
                    <div className="mt-4 bg-[#DAF1DE] dark:bg-[#0A1916] p-4 rounded-md space-y-2 text-[#333333] dark:text-[#E0F0E9]">
                        <p><strong>Recipient:</strong> {instructions.recipient_name}</p>
                        <p><strong>Binance Pay ID:</strong> {instructions.binance_pay_id}</p>
                        <p><strong>Network:</strong> {instructions.network} ({instructions.currency})</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#102A27] p-6 rounded-lg shadow-sm space-y-4">
                    <Input id="senderDetails" label="Your Binance Pay ID or Email" value={senderDetails} onChange={e => setSenderDetails(e.target.value)} required disabled={isSubmitting} />
                    
                    <div>
                        <label className="block text-sm font-medium text-[#235347] dark:text-[#8EB69B] mb-1">Payment Screenshot</label>
                        <div
                            onClick={() => fileInputRef.current?.click()} 
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#8EB69B]/50 dark:border-[#8EB69B]/30 border-dashed rounded-md cursor-pointer hover:border-[#235347] dark:hover:border-[#8EB69B]"
                        >
                            <div className="space-y-1 text-center">
                                {screenshotPreview ? (
                                    <img src={screenshotPreview} alt="Screenshot preview" className="mx-auto h-24 w-auto rounded-md" />
                                ) : (
                                    <UploadIcon />
                                )}
                                <div className="flex text-sm text-[#235347] dark:text-[#8EB69B]">
                                    <p className="pl-1">{screenshotFile ? screenshotFile.name : "Click to upload proof"}</p>
                                </div>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="image/*" className="hidden" disabled={isSubmitting} />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <Button type="submit" disabled={isSubmitting || !screenshotFile}>
                        {isSubmitting ? <LoadingSpinner /> : 'Submit for Review'}
                    </Button>
                </form>
            </main>
        </div>
    );
};

export default ManualPaymentPage;