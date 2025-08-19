
import React from 'react';

export const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.84a1.125 1.125 0 00-1.087-1.418H4.665L4.5 3.75H2.25m4.5 15a3 3 0 100-6 3 3 0 000 6zM15 17.25a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);
