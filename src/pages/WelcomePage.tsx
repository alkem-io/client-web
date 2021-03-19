import React, { FC } from 'react';

interface WelcomePageProps {}

export const WelcomePage: FC<WelcomePageProps> = () => {
  return (
    <div>
      <p>Welcome to the [name of ecoverse] ecoverse!</p>

      <p>[context:tagline]</p>

      <p>[context:background]</p>

      <p>
        In order to get the most value please:
        <ul>
          <li>
            Browse: Have a look through the public information from the hosted challenges, seeing which ones trigger
            your interest...
          </li>
          <li>
            Profile: Complete your profile [link to profile edit page], this makes it easier for others to find you, and
            will be used when applying to join various communities.
          </li>
          <li>Join: Apply to become a full member of the ecoverse [link to ecoverse application page]</li>
          <li>
            Contribute: After browsing the Challenges and Opportunites, join those that you want to contribute to and
            apply to join them.
          </li>
          <li>Use the search [link to search] functionality to find other relevant members , groups, organisations.</li>
        </ul>
      </p>

      <p>As with any community, the more everyone brings in the more everyone gets out!</p>

      <p>We really hope you enjoy engaging.</p>
    </div>
  );
};
export default WelcomePage;
