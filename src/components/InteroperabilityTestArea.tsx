import React from 'react';
import { LiveSimulationSuite } from './simulation/LiveSimulationSuite';

export const InteroperabilityTestArea: React.FC = () => {
  return (
    <div className="space-y-6">
      <LiveSimulationSuite />
    </div>
  );
};
