import React from 'react';
import { Typography } from '@mui/material';

// Este componente recebe um texto e renderiza partes em negrito
export default function RenderizadorMarkdown({ text, sx }) {
  // Retorna nulo ou um fragmento vazio se o texto não for fornecido, para evitar erros.
  if (!text) {
    return null;
  }
  
  // Divide o texto usando o delimitador de negrito (**)
  // A expressão regular agora lida com o texto de forma mais robusta
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

  return (
    // Usamos component="div" para poder aninhar outros Typographys dentro
    <Typography component="div" sx={sx}>
      {parts.map((part, index) => {
        // Se a parte começa e termina com **, é negrito
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            // Renderiza como um span em negrito, removendo os asteriscos
            <Typography component="span" key={index} sx={{ fontWeight: 'bold' }}>
              {part.substring(2, part.length - 2)}
            </Typography>
          );
        }
        // Caso contrário, é texto normal
        return <Typography component="span" key={index}>{part}</Typography>;
      })}
    </Typography>
  );
}