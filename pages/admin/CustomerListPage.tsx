import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Profile } from '../../types';

const CustomerListPage: React.FC = () => {
    const [customers, setCustomers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        // We need to call a database function to get emails from auth.users
        const { data, error } = await supabase.rpc('get_customers_with_email');

        if (error) {
            console.error("Error fetching customers:", error.message);
        } else {
            setCustomers((data as unknown as Profile[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleRoleChange = async (customerId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', customerId);
        
        if (error) {
            alert("Failed to update role: " + error.message);
        } else {
            // Optimistically update the UI to provide immediate feedback
            setCustomers(prevCustomers =>
                prevCustomers.map(customer =>
                    customer.id === customerId ? { ...customer, role: newRole } : customer
                )
            );
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-display mb-6">Customers</h1>
            <div className="bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                {loading ? <p>Loading customers...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-text-muted">
                            <thead className="text-xs text-gray-700 dark:text-text-primary uppercase bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Customer Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id} className="bg-white dark:bg-accent border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-text-primary">{customer.full_name || 'N/A'}</td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={customer.role}
                                                onChange={(e) => handleRoleChange(customer.id, e.target.value)}
                                                className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// **IMPORTANT**: You need to create a database function for this page to work.
// Go to Supabase SQL Editor and run this:
/*
  CREATE OR REPLACE FUNCTION get_customers_with_email()
  RETURNS TABLE (
    id uuid,
    full_name text,
    role text,
    email text
  )
  LANGUAGE sql
  SECURITY DEFINER -- Important for accessing auth.users
  AS $$
    SELECT
      p.id,
      p.full_name,
      p.role,
      u.email
    FROM
      public.profiles p
    JOIN
      auth.users u ON p.id = u.id;
  $$;
*/

export default CustomerListPage;