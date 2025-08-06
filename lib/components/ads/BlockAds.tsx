import React from 'react';

interface BlockAdsProps {
  positionId?: string;
}

const BlockAds: React.FC<BlockAdsProps> = ({ positionId = '' }) => {
  return (
    <div className="ads_masthead_banner">
      <ins
        data-aplpm="11040103-"
        data-position={positionId}
        className="adsplay-placement adsplay-placement-relative"
      />
    </div>
  );
};

export default BlockAds;
