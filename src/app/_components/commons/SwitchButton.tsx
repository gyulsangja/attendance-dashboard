'use client';

import { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

type ViewMode = 'table' | 'calendar';

const buttonStyle = {
  borderRadius: '4px',
  backgroundColor: '#f3f1f3',

  '&.Mui-selected': {
    backgroundColor: '#000',
    color: '#fff',
  },

  '&.Mui-selected:hover': {
    backgroundColor: '#000',
  },
};

export default function SwitchButton() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, value) => value && setViewMode(value)}
    >
      <ToggleButton value="table" sx={buttonStyle}>
        표
      </ToggleButton>

      <ToggleButton value="calendar" sx={buttonStyle}>
        달력
      </ToggleButton>
    </ToggleButtonGroup>
  );
}