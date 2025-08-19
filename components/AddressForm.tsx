import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';

interface AddressFormProps {
    address?: Address;
    onSuccess: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        label: address?.label || 'Home',
        address_line_1: address?.address_line_1 || '',
        city: address?.city || '',
        country: address?.country || '',
        postal_code: address?.postal_code || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        const addressData = {
            ...formData,
            user_id: user.id,
        };

        const { error } = await supabase.from('addresses').insert([addressData]);

        if (error) {
            alert('Error saving address: ' + error.message);
        } else {
            onSuccess();
        }
        setLoading(false);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Label (e.g., Home, Work)</label>
                <input type="text" name="label" value={formData.label} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Address</label>
                <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Postal Code</label>
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className={inputClasses} required />
                </div>
            </div>
            <div className="text-right">
                <button type="submit" disabled={loading} className="bg-primary text-background dark:text-white font-semibold py-2 px-6 rounded-md hover:bg-yellow-600 transition disabled:bg-primary/50">
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
            </div>
        </form>
    );
};

export default AddressForm;