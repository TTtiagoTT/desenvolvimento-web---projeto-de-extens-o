import React from 'react';
import { Typography } from '@mui/material';

export default function RenderizadorMarkdown({ text, sx }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

  return (
    <Typography component="div" sx={sx}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Typography component="span" key={index} sx={{ fontWeight: 'bold' }}>
              {part.substring(2, part.length - 2)}
            </Typography>
          );
        }
        return <Typography component="span" key={index}>{part}</Typography>;
      })}
    </Typography>
  );
}