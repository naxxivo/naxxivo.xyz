import React, { useState, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { BackArrowIcon, UploadIcon, CoinIcon } from '../common/AppIcons';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import type { Session } from '@supabase/auth-js';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAvatar } from '../../utils/helpers';

interface UploadCoverPageProps {
    onBack: () => void;
    session: Session;
}

const UPLOAD_COST = 25000;

const pageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const UploadCoverPage: React.FC<UploadCoverPageProps> = ({ onBack, session }) => {
    const [step, setStep] = useState<'upload' | 'details'>('upload');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/png') {
                setError('Please upload a PNG image.');
                return;
            }
             if (file.size > 1 * 1024 * 1024) { // 1MB limit
                setError('File size cannot exceed 1MB.');
                return;
            }
            setError(null);
            setCoverFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setStep('details');
        }
    };

    const resetUpload = () => {
        setStep('upload');
        setCoverFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !coverFile) {
            setError('Please provide a name and select an image file.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            // 1. Upload file to storage
            const fileName = `${session.user.id}-${Date.now()}-${coverFile!.name}`;
            const { error: uploadError } = await supabase.storage
                .from('profile-covers')
                .upload(fileName, coverFile!);
            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile-covers')
                .getPublicUrl(fileName);

            // 3. Call RPC to create store item and deduct XP
            const { data, error: rpcError } = await supabase.rpc('create_user_profile_cover', {
                p_name: name,
                p_description: description,
                p_preview_url: publicUrl
            });

            if (rpcError) throw rpcError;

            if (data && data.startsWith('Error:')) {
                throw new Error(data);
            }

            alert(data || "Submission successful! Your cover is now under review.");
            onBack();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during submission.");
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">Create a Profile Cover</h1>
                <div className="w-6"></div>
            </header>

            <main className="flex-grow p-4">
                <AnimatePresence mode="wait">
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            {...{
                                variants: pageVariants,
                                initial: "hidden",
                                animate: "visible",
                                exit: "exit",
                            } as any}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-sm p-8 border-2 border-dashed border-[var(--theme-secondary)]/50 rounded-2xl cursor-pointer hover:border-[var(--theme-primary)] hover:bg-[var(--theme-card-bg-alt)] transition-colors"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <img src={generateAvatar('Sample')} alt="Sample Avatar" className="w-full h-full rounded-full object-cover"/>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <svg className="w-40 h-40 text-[var(--theme-text-secondary)]/50" fill="none" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[var(--theme-primary)]">
                                        <UploadIcon className="w-12 h-12"/>
                                    </div>
                                </div>
                                
                                <h2 className="text-lg font-bold text-[var(--theme-text)]">Upload Your Cover</h2>
                                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Click here to select a PNG file (max 1MB).</p>
                            </div>

                            <div className="mt-6 p-4 bg-[var(--theme-card-bg)] rounded-xl w-full max-w-sm text-left text-sm space-y-2">
                                <h3 className="font-bold text-base text-[var(--theme-text)]">Submission Guidelines</h3>
                                <div className="flex items-start gap-3">
                                    <CoinIcon className="w-5 h-5 mt-0.5 text-[var(--theme-primary)] flex-shrink-0" />
                                    <p className="text-[var(--theme-text-secondary)]"><strong>Cost:</strong> A one-time fee of <strong>{UPLOAD_COST.toLocaleString()} XP</strong> will be deducted upon submission.</p>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <span className="mt-0.5">✅</span>
                                    <p className="text-[var(--theme-text-secondary)]"><strong>Format:</strong> Use a square PNG image with a transparent background for the center part.</p>
                                 </div>
                                 <div className="flex items-start gap-3">
                                    <span className="mt-0.5">🧐</span>
                                    <p className="text-[var(--theme-text-secondary)]"><strong>Review:</strong> All submissions will be reviewed by an admin before appearing in the Bazaar.</p>
                                 </div>
                            </div>
                            
                            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        </motion.div>
                    )}

                    {step === 'details' && (
                         <motion.div
                            key="details"
                            {...{
                                variants: pageVariants,
                                initial: "hidden",
                                animate: "visible",
                                exit: "exit",
                            } as any}
                            className="flex flex-col h-full"
                        >
                            <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-sm flex-grow">
                                <h3 className="font-bold text-center text-[var(--theme-text)] mb-4">Live Preview</h3>
                                <div className="relative w-40 h-40 mx-auto bg-[var(--theme-bg)] rounded-full flex items-center justify-center">
                                    <img src={generateAvatar('Sample')} alt="Sample Avatar" className="w-32 h-32 rounded-full object-cover"/>
                                    {previewUrl && <img src={previewUrl} alt="Cover Preview" className="absolute inset-0 w-full h-full object-contain p-1" />}
                                </div>
                                <div className="text-center mt-4">
                                    <Button onClick={resetUpload} variant="secondary" size="small" className="w-auto">Change Image</Button>
                                </div>
                                
                                <div className="mt-6 space-y-4">
                                     <Input id="name" label="Cover Name" value={name} onChange={e => setName(e.target.value)} required />
                                     <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Description</label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={2}
                                            placeholder="A short, catchy description."
                                            className="appearance-none block w-full px-4 py-3 bg-[var(--theme-bg)] border-transparent border rounded-lg text-[var(--theme-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] sm:text-sm"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                </div>
                            </div>
                             <div className="mt-4">
                                <Button onClick={handleSubmit} disabled={isSubmitting || !coverFile || !name}>
                                    Submit for Review
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png" className="hidden" />
            </main>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSubmit}
                title="Confirm Submission"
                message={`Submitting this cover will cost ${UPLOAD_COST.toLocaleString()} XP. This fee is non-refundable and does not guarantee approval. Are you sure you want to proceed?`}
                confirmText={`Yes, pay ${UPLOAD_COST.toLocaleString()} XP`}
                isConfirming={isSubmitting}
            />
        </div>
    );
};

export default UploadCoverPage;