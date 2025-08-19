
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Navigate } from 'react-router-dom';
import AddressStep from '../components/checkout/AddressStep';
import DeliveryStep from '../components/checkout/DeliveryStep';
import PaymentStep from '../components/checkout/PaymentStep';
import CheckoutSummary from '../components/checkout/CheckoutSummary';

type CheckoutStep = 'address' | 'delivery' | 'payment';

const CheckoutPage: React.FC = () => {
    const { cartCount } = useCart();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');

    if (cartCount === 0) {
        return <Navigate to="/cart" replace />;
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'address':
                return <AddressStep onNext={() => setCurrentStep('delivery')} />;
            case 'delivery':
                return <DeliveryStep onNext={() => setCurrentStep('payment')} onBack={() => setCurrentStep('address')} />;
            case 'payment':
                return <PaymentStep onBack={() => setCurrentStep('delivery')} />;
            default:
                return null;
        }
    };
    
    const steps: { name: CheckoutStep, label: string }[] = [
        { name: 'address', label: 'Address' },
        { name: 'delivery', label: 'Delivery' },
        { name: 'payment', label: 'Payment' }
    ];
    const currentStepIndex = steps.findIndex(step => step.name === currentStep);

    return (
        <div className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold font-display text-center mb-8">Checkout</h1>
                
                {/* Progress Indicator */}
                <div className="w-full max-w-2xl mx-auto mb-12">
                   <div className="flex items-center">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.name}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index <= currentStepIndex ? 'bg-primary text-background dark:text-white' : 'bg-gray-200 dark:bg-accent text-gray-500 dark:text-text-muted'}`}>
                                        {index + 1}
                                    </div>
                                    <p className={`mt-2 text-sm font-semibold ${index <= currentStepIndex ? 'text-primary' : 'text-gray-500 dark:text-text-muted'}`}>{step.label}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-accent'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
                        {renderStep()}
                    </div>
                    <div className="lg:col-span-1">
                        <CheckoutSummary />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;