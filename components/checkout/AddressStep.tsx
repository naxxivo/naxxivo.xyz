
import React, { useState } from 'react';
import { useCheckout } from '../../context/CheckoutContext';
import { ShippingAddress } from '../../types';

interface AddressStepProps {
    onNext: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ onNext }) => {
    const { checkoutState, setShippingAddress } = useCheckout();
    const [formData, setFormData] = useState<ShippingAddress>(checkoutState.shippingAddress || {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShippingAddress(formData);
        onNext();
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">First Name</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClasses} required />
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
                        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>
                <div className="pt-6">
                    <button type="submit" className="w-full bg-primary text-background dark:text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition">
                        Continue to Delivery
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressStep;