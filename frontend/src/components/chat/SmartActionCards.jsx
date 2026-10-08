import React from 'react';
import SmartActionCard from './SmartActionCard';

const SmartActionCards = ({ actions }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="px-4 md:px-8 mt-2 mb-6 animate-fade-in">
      <div className="md:pl-11 md:pr-4"> {/* Align with bot message bubble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <SmartActionCard key={index} action={action} delayIndex={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartActionCards;
