
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ToolsMenuView from './ToolsMenuView';
import BatteryCalcView from './BatteryCalcView';
import CalibrationView from './CalibrationView';
import UnitConverterView from './UnitConverterView';
import RepairFeasibilityView from './RepairFeasibilityView';

const ToolsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ToolsMenuView />} />
      <Route path="battery" element={<BatteryCalcView />} />
      <Route path="calibration" element={<CalibrationView />} />
      <Route path="converter" element={<UnitConverterView />} />
      <Route path="feasibility" element={<RepairFeasibilityView />} />
    </Routes>
  );
};

export default ToolsRoutes;
