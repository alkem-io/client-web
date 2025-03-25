import React from 'react';

/**
 *
 * @deprecated
 * @returns
 */
const DeleteIcon = ({ fill = '#B30000' }) => (
  <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1612_5773)">
      <mask id="mask0_1612_5773" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="24">
        <path d="M22 0H0V24H22V0Z" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1612_5773)">
        <path
          d="M6.41699 21C5.91282 21 5.48138 20.8043 5.12266 20.413C4.76332 20.021 4.58366 19.55 4.58366 19V6H3.66699V4H8.25032V3H13.7504V4H18.3336V6H17.417V19C17.417 19.55 17.2376 20.021 16.8789 20.413C16.5196 20.8043 16.0879 21 15.5836 21H6.41699ZM15.5836 6H6.41699V19H15.5836V6ZM8.25032 17H10.0837V8H8.25032V17ZM11.917 17H13.7504V8H11.917V17Z"
          fill={fill}
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_1612_5773">
        <rect width="22" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default DeleteIcon;
