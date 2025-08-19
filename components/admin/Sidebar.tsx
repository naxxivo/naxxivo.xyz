
import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
    { to: '/admin', text: 'Dashboard' },
    { to: '/admin/products', text: 'Products' },
    { to: '/admin/orders', text: 'Orders' },
    { to: '/admin/customers', text: 'Customers' },
];

const Sidebar: React.FC = () => {
    const activeLinkClass = 'bg-primary text-background dark:text-white';
    const inactiveLinkClass = 'text-gray-800 dark:text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800';

    return (
        <aside className="w-64 bg-white dark:bg-accent p-4 border-r border-gray-200 dark:border-slate-800 hidden lg:block">
            <nav>
                <ul className="space-y-2">
                    {navLinks.map(link => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                end={link.to === '/admin'}
                                className={({ isActive }) => 
                                    `w-full text-left px-4 py-2.5 rounded-md transition text-sm font-medium block ${isActive ? activeLinkClass : inactiveLinkClass}`
                                }
                            >
                                {link.text}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;