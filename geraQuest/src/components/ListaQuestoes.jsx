import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Stack, Divider, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ConteudoProva from './ConteudoProva';

// O prop onReset é novo!
export default function ListaQuestoes({ questoes, nomeProfessor, dadosFormulario, onReset }) {
  const [exportando, setExportando] = useState(null); // 'aluno', 'professor', ou null

  const handleExportPDF = (isGabarito) => {
    const tipo = isGabarito ? 'professor' : 'aluno';
    setExportando(tipo);

    const elementId = isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf";
    const input = document.getElementById(elementId);
    
    const fileName = isGabarito 
        ? `Gabarito_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`
        : `Prova_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`;

    if (!input) {
      console.error("Elemento para exportação não encontrado!");
      setExportando(null);
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const totalImgHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        let heightLeft = totalImgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(fileName);
      })
      .catch(err => console.error("Erro ao gerar PDF: ", err))
      .finally(() => setExportando(null));
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>Prova Gerada com Sucesso!</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sua avaliação sobre "{dadosFormulario.tema}" com {questoes.length} questões está pronta para ser exportada.
        </Typography>
        
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
            <Button variant="contained" color="primary" onClick={() => handleExportPDF(false)} disabled={!!exportando} startIcon={<PictureAsPdfIcon />}>
              {exportando === 'aluno' ? <CircularProgress size={24} color="inherit" /> : 'Exportar Prova do Aluno'}
            </Button>
            <Button variant="outlined" color="primary" onClick={() => handleExportPDF(true)} disabled={!!exportando} startIcon={<PictureAsPdfIcon />}>
              {exportando === 'professor' ? <CircularProgress size={24} /> : 'Exportar Gabarito'}
            </Button>
        </Stack>

        <Divider sx={{ my: 4 }}>
          <Chip label="OU" />
        </Divider>
        
        <Button variant="text" onClick={onReset} startIcon={<AddCircleOutlineIcon />}>
            Gerar Nova Prova
        </Button>
      </Box>

      {/* --- ATUALIZADO: Contêiner para neutralizar os componentes do PDF e não afetar o layout --- */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: '100%', // Empurra o contêiner para fora da tela
        width: 1,      // Largura e altura mínimas
        height: 1, 
        overflow: 'hidden', // Esconde qualquer conteúdo que "vaze"
        zIndex: -1 
      }}>
        <ConteudoProva isGabarito={false} questoes={questoes} nomeProfessor={nomeProfessor} dadosFormulario={dadosFormulario}/>
        <ConteudoProva isGabarito={true} questoes={questoes} nomeProfessor={nomeProfessor} dadosFormulario={dadosFormulario}/>
      </Box>
    </Box>
  );
}