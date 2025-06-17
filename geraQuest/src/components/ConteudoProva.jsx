import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

// NOVO: Adicionamos "isGabarito" como uma propriedade. 
// O valor padrão é false.
export default function ConteudoProva({ id, titulo, nomeProfessor, conteudo, isGabarito = false }) {
  return (
    <Box 
      id={id} 
      sx={{ 
        backgroundColor: 'white', 
        color: 'black', 
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box'
      }}
    >
      {/* --- CABEÇALHO COM LOGOTIPO --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', pb: 2, mb: 2 }}>
        <img src="/logo.png" alt="Logotipo" style={{ width: '160px', height: 'auto' }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Data: _______/_______/___________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Nota final: _________ de _________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 2 }}>Disciplina: {conteudo.tema}</Typography>
        </Box>
      </Box>

      {/* --- NOVO: CAMPO PARA NOME DO ALUNO --- */}
      {/* Esta seção só será exibida se "isGabarito" for falso! */}
      {!isGabarito && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 4, mb: 3 }}>
          <Typography sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', mr: 1, fontWeight: 'bold' }}>
            Nome do Aluno:
          </Typography>
          {/* Esta caixa cria uma linha que preenche o espaço restante */}
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid black' }} />
        </Box>
      )}

      {/* --- INFORMAÇÕES DO PROFESSOR E DISCIPLINA --- */}
      <Typography sx={{fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 1 }}>
        Professor(a): {nomeProfessor}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* --- TÍTULO E CONTEÚDO DA PROVA --- */}
      <Typography 
        variant="h5" 
        component="h1" 
        align="center" 
        gutterBottom 
        sx={{ 
          fontFamily: '"Times New Roman", serif', 
          fontWeight: 'bold',
          fontSize: '16pt',
          mb: 4,
        }}
      >
        {titulo}
      </Typography>

      <Typography
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',       
          fontFamily: '"Times New Roman", serif',
          fontSize: '12pt',             
          lineHeight: 1.6,
        }}
      >
        {conteudo.textoProva}
      </Typography>
    </Box>
  );
}