import React, { useState, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { UploadIcon } from '../common/AppIcons';
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            alert(data || "Submission successful! Your item is now pending approval.");
            onBack();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during submission.");
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col">
            <main className="flex-grow space-y-6 max-w-lg mx-auto">
                <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-sm">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 mx-auto bg-[var(--theme-bg)] rounded-full flex items-center justify-center border-2 border-dashed border-[var(--theme-secondary)]/50 cursor-pointer hover:border-[var(--theme-primary)]"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center text-[var(--theme-text-secondary)]">
                                <UploadIcon className="w-10 h-10 mx-auto" />
                                <p className="text-xs mt-1">Click to Upload (PNG)</p>
                            </div>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFileChange} className="hidden" />
                    
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <Input id="coverName" label="Cover Name" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
                        <Input id="coverDescription" label="Description" value={description} onChange={e => setDescription(e.target.value)} disabled={isSubmitting} />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div className="pt-4">
                            <Button type="submit" disabled={isSubmitting || !coverFile}>
                                {isSubmitting ? <LoadingSpinner /> : 'Submit for Approval'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSubmit}
                isConfirming={isSubmitting}
                title="Confirm Submission"
                message={`Submitting a new profile cover costs ${UPLOAD_COST.toLocaleString()} XP. This will be deducted from your balance. Are you sure you want to proceed?`}
                confirmText="Yes, Submit"
            />
        </div>
    );
};

export default UploadCoverPage;