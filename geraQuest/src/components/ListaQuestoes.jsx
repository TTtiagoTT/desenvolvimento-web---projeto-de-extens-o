import React, { useState } from 'react';
import { Box, Button, Paper, Typography, CircularProgress } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ConteudoProva from './ConteudoProva';

export default function ListaQuestoes({ questoes, nomeProfessor, dadosFormulario }) {
  const [exportando, setExportando] = useState(false);

  const handleExportPDF = (isGabarito) => {
    // ... (função handleExportPDF sem alterações) ...
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ p: 4, mb: 4, textAlign: 'center' }}> {/* Aumentei o elevation e o padding */}
        <Typography variant="h6" gutterBottom>Pré-visualização Pronta</Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}> {/* Adicionei cor secundária */}
          {questoes.length} questões sobre "{dadosFormulario.tema}" foram geradas com sucesso!
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}> {/* Adicionei cor secundária */}
          Exporte os arquivos em PDF para visualização completa e impressão.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleExportPDF(false)}
            disabled={exportando}
            sx={{ minWidth: '200px' }}
          >
            {exportando ? <CircularProgress size={24} /> : 'Exportar PDF do Aluno'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleExportPDF(true)}
            disabled={exportando}
            sx={{ minWidth: '200px' }}
          >
            {exportando ? <CircularProgress size={24} /> : 'Exportar PDF do Professor'}
          </Button>
        </Box>
      </Paper>

      {/* Componentes invisíveis para o PDF (sem alterações) */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
        <ConteudoProva
          isGabarito={false}
          questoes={questoes}
          nomeProfessor={nomeProfessor}
          dadosFormulario={dadosFormulario}
        />
        <ConteudoProva
          isGabarito={true}
          questoes={questoes}
          nomeProfessor={nomeProfessor}
          dadosFormulario={dadosFormulario}
        />
      </Box>
    </Box>
  );
}