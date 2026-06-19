'use client'
import { staffs } from '@/mocks/management/staffs';

import { useState } from 'react';
import {

  List,
  ListItemButton,
  ListItemText,
  Collapse,
} from '@mui/material';

import {
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';


export default function StaffList() {
    
      const [open, setOpen] = useState([false, false, false, false, false]);
          
    
      const handleClick = (index: number) => {
        setOpen((prev) =>
          prev.map((item, i) =>
            i === index ? !item : item
          )
        );
      };

  return (
     <nav className="bg-white p-4 rounded-lg w-60">
      <h2 className='font-bold'>직원 리스트</h2>
       <List
        sx={{ width: '100%', Width: '100%', bgcolor: 'background.paper', fontSize: '16px' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
      {
        staffs.map((t, idx)=>(
          <div key={idx}>
          <ListItemButton onClick={() => handleClick(idx)}>
            <ListItemText primary={`${t.teamTitle}`} />
            {open[idx] ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open[idx]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {
                t.staff.map((i, idx)=>(
                  <ListItemButton sx={{ pl: 4 }} key={idx}>
                    <ListItemText primary={i.name} />
                  </ListItemButton>
                ))
              }
            </List>
          </Collapse>
          </div>
        ))
        }
      </List>
    </nav>
  );
}