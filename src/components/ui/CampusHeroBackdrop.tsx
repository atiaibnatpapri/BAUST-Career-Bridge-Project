/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export const CampusHeroBackdrop: React.FC = () => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-[#0B2A3F] to-[#0F4C5C] pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {!imgFailed && (
        <img
          src="/baust-campus.jpg"
          alt="Bangladesh Army University of Science and Technology campus"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Dark blue-teal scrim weighted toward the left text column */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(11, 42, 63, 0.88) 0%, rgba(11, 42, 63, 0.74) 52%, rgba(15, 76, 92, 0.58) 100%)',
        }}
      />

      {/* Subtle architectural dotted network pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="bcb-hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#5EEAD4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bcb-hero-dots)" />
        <g stroke="#2DD4BF" strokeWidth="1" opacity="0.45">
          <line x1="8%" y1="78%" x2="28%" y2="56%" />
          <line x1="28%" y1="56%" x2="46%" y2="68%" />
          <line x1="56%" y1="24%" x2="78%" y2="38%" />
          <line x1="78%" y1="38%" x2="92%" y2="20%" />
          <line x1="62%" y1="82%" x2="84%" y2="66%" />
        </g>
        <g fill="#5EEAD4" opacity="0.7">
          <circle cx="8%" cy="78%" r="2.5" />
          <circle cx="28%" cy="56%" r="2.5" />
          <circle cx="46%" cy="68%" r="2.5" />
          <circle cx="56%" cy="24%" r="2.5" />
          <circle cx="78%" cy="38%" r="2.5" />
          <circle cx="92%" cy="20%" r="2.5" />
          <circle cx="62%" cy="82%" r="2.5" />
          <circle cx="84%" cy="66%" r="2.5" />
        </g>
      </svg>
    </div>
  );
};
