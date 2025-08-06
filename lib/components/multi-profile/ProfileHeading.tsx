import React from 'react';

interface ProfileHeadingProps {
  variant?: string;
  children: React.ReactNode;
}

const ProfileHeading: React.FC<ProfileHeadingProps> = ({ variant = '', children }) => {
  return (
    <h1
      className={`
        text-white-smoke inline-block font-semibold text-[20px] tablet:text-[32px] leading-[1.3] text-left
        ${variant}
      `}
    >
      {children}
    </h1>
  );
};

export default ProfileHeading;