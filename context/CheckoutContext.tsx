
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CheckoutState, ShippingAddress, DeliveryMethod } from '../types';

interface CheckoutContextType {
  checkoutState: CheckoutState;
  setShippingAddress: (address: ShippingAddress) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const initialAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
};

const availableDeliveryMethods: DeliveryMethod[] = [
    { id: 'standard', name: 'Standard Shipping', cost: 5.00, eta: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', cost: 15.00, eta: '1-2 business days' },
];

const initialState: CheckoutState = {
  shippingAddress: null,
  deliveryMethod: availableDeliveryMethods[0],
};

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialState);

  const setShippingAddress = (address: ShippingAddress) => {
    setCheckoutState(prevState => ({ ...prevState, shippingAddress: address }));
  };

  const setDeliveryMethod = (method: DeliveryMethod) => {
    setCheckoutState(prevState => ({ ...prevState, deliveryMethod: method }));
  };

  const resetCheckout = () => {
      setCheckoutState(initialState);
  }

  return (
    <CheckoutContext.Provider value={{ checkoutState, setShippingAddress, setDeliveryMethod, resetCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
