import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../../types';

interface AddProductFromUrlModalProps {
    onClose: () => void;
    onDataFetched: (data: Partial<Product>) => void;
}

const AddProductFromUrlModal: React.FC<AddProductFromUrlModalProps> = ({ onClose, onDataFetched }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchData = async () => {
        if (!url) {
            setError('Please enter a valid URL.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `From the content of the webpage at this URL: ${url}, extract the product information.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: 'The full name of the product.' },
                            description: { type: Type.STRING, description: 'A detailed description of the product.' },
                            price: { type: Type.NUMBER, description: 'The main price of the product, as a number, without currency symbols.' },
                            image_url: { type: Type.STRING, description: 'The absolute URL to the main product image.' }
                        },
                        required: ["name", "price", "image_url"]
                    },
                },
            });
            
            const text = response.text.trim();
            const extractedData = JSON.parse(text);

            if (!extractedData.name || !extractedData.price) {
                throw new Error("Could not extract essential product details (name, price).");
            }
            
            onDataFetched({
                ...extractedData,
                source_url: url,
                is_external: true,
            });

        } catch (err: any) {
            console.error("Error fetching product data from URL:", err);
            setError(err.message || 'Failed to fetch or parse product data. Please check the URL and try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-accent rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-slate-700">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold font-display">Add Product from URL</h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-text-muted">
                        Enter the URL of a product page, and we'll try to automatically fill in the details using AI.
                    </p>
                    <div>
                        <label className="block text-sm font-medium">Product URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/product/..."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <div className="p-6 flex justify-end space-x-4 bg-gray-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-text-primary font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition">
                        Cancel
                    </button>
                    <button onClick={handleFetchData} disabled={loading} className="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-emerald-700 transition disabled:bg-emerald-800">
                        {loading ? 'Fetching...' : 'Fetch Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductFromUrlModal;