
import React, { useState } from 'react';
import { useCheckout } from '../../context/CheckoutContext';
import { DeliveryMethod } from '../../types';

interface DeliveryStepProps {
    onNext: () => void;
    onBack: () => void;
}

const availableMethods: DeliveryMethod[] = [
    { id: 'standard', name: 'Standard Shipping', cost: 5.00, eta: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', cost: 15.00, eta: '1-2 business days' },
];

const DeliveryStep: React.FC<DeliveryStepProps> = ({ onNext, onBack }) => {
    const { checkoutState, setDeliveryMethod } = useCheckout();
    const [selectedMethodId, setSelectedMethodId] = useState(checkoutState.deliveryMethod?.id || 'standard');
    
    const handleSelectMethod = (method: DeliveryMethod) => {
        setSelectedMethodId(method.id);
        setDeliveryMethod(method);
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Delivery Method</h2>
            <div className="space-y-4">
                {availableMethods.map(method => (
                     <label key={method.id} className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethodId === method.id ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'}`}>
                        <input type="radio" name="deliveryMethod" value={method.id} checked={selectedMethodId === method.id} onChange={() => handleSelectMethod(method)} className="sr-only" />
                        <div className="flex justify-between">
                            <span className="font-semibold">{method.name}</span>
                            <span>${method.cost.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-text-muted">{method.eta}</p>
                    </label>
                ))}
            </div>
            <div className="pt-6 flex justify-between items-center">
                 <button onClick={onBack} className="text-sm font-medium text-gray-600 dark:text-text-muted hover:text-primary">
                    &larr; Back to Address
                </button>
                <button onClick={onNext} className="bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition">
                    Continue to Payment
                </button>
            </div>
        </div>
    );
};

export default DeliveryStep;