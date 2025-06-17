import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Divider, CircularProgress } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ConteudoProva from './ConteudoProva';

export default function ListaQuestoes({ provaParaAluno, provaParaProfessor, nomeProfessor, dadosFormulario }) {
  const [exportando, setExportando] = useState(false);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => alert('Conteúdo copiado para a área de transferência!'))
      .catch(err => console.error('Falha ao copiar: ', err));
  };

  // FUNCIONALIDADE 4 (Múltiplas Páginas)
  const handleExportPDF = (elementId, fileName) => {
    setExportando(true);

    const input = document.getElementById(elementId);
    if (!input) {
      console.error("Elemento para exportação não encontrado!");
      setExportando(false);
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Lógica para Múltiplas Páginas
        const imgProperties = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

        let heightLeft = pdfHeight;
        let position = 0;

        // Adiciona a primeira página
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        // Adiciona mais páginas se o conteúdo for maior que uma página A4
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(fileName);
      })
      .catch(err => {
        console.error("Erro ao gerar PDF: ", err);
      })
      .finally(() => {
        setExportando(false);
      });
  };

  return (
    <Box>
      {/* --- SEÇÃO VISÍVEL PARA O USUÁRIO (sem alterações) --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Prova do Aluno</Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', p: 2, border: '1px solid #ddd', borderRadius: 1, maxHeight: 300, overflowY: 'auto' }}>
          {provaParaAluno}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => handleCopy(provaParaAluno)}>Copiar</Button>
            <Button
                variant="contained"
                onClick={() => handleExportPDF('prova-aluno-pdf', `Prova_Aluno_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`)}
                disabled={exportando}
            >
                {exportando ? <CircularProgress size={24} /> : 'Exportar PDF Aluno'}
            </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">Gabarito do Professor</Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', p: 2, border: '1px solid #ddd', borderRadius: 1, maxHeight: 300, overflowY: 'auto' }}>
          {provaParaProfessor}
        </Typography>
         <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => handleCopy(provaParaProfessor)}>Copiar</Button>
            <Button
                variant="contained"
                onClick={() => handleExportPDF('prova-professor-pdf', `Prova_Professor_Gabarito_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`)}
                disabled={exportando}
            >
                {exportando ? <CircularProgress size={24} /> : 'Exportar PDF Professor'}
            </Button>
        </Box>
      </Paper>

      {/* --- COMPONENTES INVISÍVEIS (APENAS PARA GERAR O PDF) --- */}
      <Box sx={{ border: '2px solid red', mt: 4 }}>
        {/* sx={{ border: '2px solid red', mt: 4 }} PARA VER O PDF ANTES DE EXPORTAR  sx={{ position: 'absolute', left: '-9999px', top: 0 }}*/}
        <ConteudoProva
          id="prova-aluno-pdf"
          titulo="Avaliação do ALUNO"
          nomeProfessor={nomeProfessor}
          conteudo={{ textoProva: provaParaAluno, tema: dadosFormulario.tema }}
          // AVISO: Esta é a prova do aluno, então isGabarito é false.
          // Como o padrão já é false, esta linha é opcional, mas a deixamos para clareza.
          isGabarito={false} 
        />
        <ConteudoProva
          id="prova-professor-pdf"
          titulo="Avaliação do PROFESSOR (Com Gabarito)"
          nomeProfessor={nomeProfessor}
          conteudo={{ textoProva: provaParaProfessor, tema: dadosFormulario.tema }}
          // AVISO: Esta é a prova do professor, então isGabarito é true.
          isGabarito={true}
        />
      </Box>
    </Box>
  );
}