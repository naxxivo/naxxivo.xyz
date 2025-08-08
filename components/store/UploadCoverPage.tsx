import React, { useState, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { BackArrowIcon, UploadIcon } from '../common/AppIcons';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import type { Session } from '@supabase/auth-js';

interface UploadCoverPageProps {
    onBack: () => void;
    session: Session;
}

const UPLOAD_COST = 25000;

const UploadCoverPage: React.FC<UploadCoverPageProps> = ({ onBack, session }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/png') {
                setError('Please upload a PNG image with a transparent background for the best results.');
                return;
            }
            setError(null);
            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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

            alert(data || "Submission successful!");
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
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">Submit a Profile Cover</h1>
                <div className="w-6"></div>
            </header>

            <main className="flex-grow p-4 space-y-6">
                <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-sm">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 mx-auto bg-[var(--theme-bg)] rounded-full flex items-center justify-center border-2 border-dashed border-[var(--theme-secondary)]/50 cursor-pointer hover:border-[var(--theme-primary)]"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-[var(--theme-text-secondary)]">
                                <UploadIcon className="w-10 h-10 mx-auto" />
                                <p className="text-xs mt-1">Click to Upload</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png" className="hidden" />
                    <p className="text-xs text-center mt-2 text-[var(--theme-text-secondary)]">For best results, use a square PNG with a transparent center.</p>
                </div>

                <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-sm space-y-4">
                    <Input id="name" label="Cover Name" value={name} onChange={e => setName(e.target.value)} required />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="appearance-none block w-full px-4 py-3 bg-[var(--theme-bg)] border-transparent border rounded-lg text-[var(--theme-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] sm:text-sm"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting || !coverFile || !name}>
                    Submit for Review
                </Button>
            </main>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSubmit}
                title="Confirm Submission"
                message={`Submitting this cover will cost ${UPLOAD_COST.toLocaleString()} XP. This fee is non-refundable. Are you sure you want to proceed?`}
                confirmText={`Yes, pay ${UPLOAD_COST.toLocaleString()} XP`}
                isConfirming={isSubmitting}
            />
        </div>
    );
};

export default UploadCoverPage;