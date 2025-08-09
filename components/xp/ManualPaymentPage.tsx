import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, TablesInsert, Json } from '../../integrations/supabase/types';
import { BackArrowIcon, UploadIcon, CoinIcon } from '../common/AppIcons';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import type { NotificationDetails } from '../common/NotificationPopup';
import { motion } from 'framer-motion';

interface ManualPaymentPageProps {
    onBack: () => void;
    session: Session;
    productId: number;
    onSubmit: () => void;
    showNotification: (details: NotificationDetails) => void;
}

type Product = Tables<'products'>;

interface PaymentInstructions {
    binance_pay_id: string;
    recipient_name: string;
    network: string;
    currency: string;
}

const ManualPaymentPage: React.FC<ManualPaymentPageProps> = ({ onBack, session, productId, onSubmit, showNotification }) => {
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
            const fileName = `${session.user.id}-${Date.now()}-${screenshotFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(fileName, screenshotFile);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(fileName);

            const newPayment: TablesInsert<'manual_payments'> = {
                user_id: session.user.id,
                product_id: product.id,
                amount: product.price,
                sender_details: senderDetails,
                screenshot_url: publicUrl,
                status: 'pending'
            };

            const { error: insertError } = await supabase.from('manual_payments').insert(newPayment);
            if (insertError) throw insertError;
            
            showNotification({
                type: 'success',
                title: 'Submission Received',
                message: 'Your payment is now under review. This can take up to 24 hours.'
            });
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
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <header className="flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">Complete Your Purchase</h1>
                <div className="w-6"></div>
            </header>

            <main className="p-4 space-y-6">
                {/* Step 1: Order Summary */}
                <motion.div {...{initial:{opacity:0, y:20}, animate:{opacity:1, y:0}, transition:{delay:0.1}} as any}>
                    <div className="bg-[var(--theme-card-bg)] p-5 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--theme-text-secondary)]">You are purchasing</p>
                                <h2 className="text-xl font-bold text-[var(--theme-text)]">{product.name}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-[var(--theme-text-secondary)]">Total</p>
                                <p className="text-2xl font-bold text-[var(--theme-primary)]">${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Step 2: Payment Instructions */}
                <motion.div {...{initial:{opacity:0, y:20}, animate:{opacity:1, y:0}, transition:{delay:0.2}} as any}>
                     <div className="bg-[var(--theme-card-bg)] p-5 rounded-xl shadow-sm">
                        <h3 className="font-bold text-[var(--theme-text)] text-lg mb-3">Payment Instructions</h3>
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-4">Send the exact amount to the following Binance Pay account.</p>
                        <div className="space-y-3 bg-[var(--theme-bg)] p-4 rounded-lg">
                             {Object.entries({
                                'Recipient': instructions.recipient_name,
                                'Binance Pay ID': instructions.binance_pay_id,
                                'Network': `${instructions.network} (${instructions.currency})`
                            }).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--theme-text-secondary)]">{key}</span>
                                    <span className="font-semibold text-[var(--theme-text)]">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Step 3: Submit Proof */}
                 <motion.div {...{initial:{opacity:0, y:20}, animate:{opacity:1, y:0}, transition:{delay:0.3}} as any}>
                    <form onSubmit={handleSubmit} className="bg-[var(--theme-card-bg)] p-5 rounded-xl shadow-sm space-y-4">
                        <h3 className="font-bold text-[var(--theme-text)] text-lg">Submit Your Proof</h3>
                        <Input id="senderDetails" label="Your Binance Pay ID or Email" value={senderDetails} onChange={e => setSenderDetails(e.target.value)} required disabled={isSubmitting} />
                        
                        <div>
                            <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Payment Screenshot</label>
                            <div
                                onClick={() => fileInputRef.current?.click()} 
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--theme-secondary)]/50 border-dashed rounded-lg cursor-pointer hover:border-[var(--theme-primary)] transition-colors"
                            >
                                <div className="space-y-1 text-center">
                                    {screenshotPreview ? (
                                        <img src={screenshotPreview} alt="Screenshot preview" className="mx-auto h-24 w-auto rounded-md" />
                                    ) : (
                                        <UploadIcon className="mx-auto h-10 w-10 text-[var(--theme-text-secondary)]" />
                                    )}
                                    <div className="flex text-sm text-[var(--theme-text-secondary)]">
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
                </motion.div>
            </main>
        </div>
    );
};

export default ManualPaymentPage;