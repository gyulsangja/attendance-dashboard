'use client';

import { useState } from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { filterCode } from '@/mocks/filterCodes';

export default function FilterCode() {
  const allCodes = filterCode.map((item) => item.label);

  const [formats, setFormats] = useState<string[]>(allCodes);

  const handleFormat = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    if (newFormats.includes('ALL')) {
      const isAllSelected =
        formats.length === allCodes.length;

      setFormats(
        isAllSelected
          ? []
          : allCodes
      );

      return;
    }

    setFormats(newFormats);
  };

  return (
    <ToggleButtonGroup
      value={formats}
      onChange={handleFormat}
      aria-label="근태코드 필터"
      sx={{
        gap: 0.5,
        flexWrap: 'wrap',

        '& .MuiToggleButton-root': {
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            color: '#666',
            backgroundColor: '#fff',

        '&.Mui-selected': {
            backgroundColor: '#bebebe',
            color: '#535353',
            fontWeight: 800,
        },

        '&.Mui-selected:hover': {
        backgroundColor: '#f3f4f6',
        },
        },
        }}
    >
      <ToggleButton
        value="ALL"
        selected={formats.length === allCodes.length}
      >
        전체
      </ToggleButton>

      {filterCode.map((item) => (
        <ToggleButton
          key={item.label}
          value={item.label}
        >
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}



