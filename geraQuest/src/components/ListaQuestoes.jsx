import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Stack, Divider, Chip, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
//bibliotecas de pdf
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
//componentes q criamos
import ConteudoProva from './ConteudoProva';
import QuestaoEditavel from './QuestaoEditavel';

export default function ListaQuestoes({ questoes, nomeProfessor, dadosFormulario, onReset, onUpdateQuestao, onDeleteQuestao }) {
  //estado que controla se estamos em exportacaoo
  const [preparandoPdf, setPreparandoPdf] = useState(null); // null, 'aluno', ou 'professor'

  // Este "hook" useEffect "escuta" as mudanças no estado 'preparandoPdf'
  useEffect(() => {
    // Se o estado não for nulo, significa que um botão de exportação foi clicado
    if (preparandoPdf) {
      const isGabarito = preparandoPdf === 'professor';
      const elementId = isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf";
      
      // Damos um pequeno tempo para o React renderizar o componente invisível no DOM
      const timer = setTimeout(() => {
        const input = document.getElementById(elementId);
        if (!input) {
          alert("Erro crítico: Elemento para exportação não foi encontrado.");
          setPreparandoPdf(null); // Reseta o estado em caso de erro
          return;
        }

        const fileName = isGabarito 
            ? `Gabarito_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`
            : `Prova_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`;

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
          .finally(() => setPreparandoPdf(null)); // Reseta o estado após a exportação
      }, 100); // 100ms de espera

      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [preparandoPdf, dadosFormulario, questoes, nomeProfessor]); // O hook só roda quando um desses valores muda

  return (
    //estrutura visual
    <>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>Revisão da Prova</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Visualize, edite ou exclua as questões geradas.</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Stack spacing={3}>
        {questoes.map((q, index) => (
          <QuestaoEditavel key={q.pergunta + index} index={index} questao={q} onUpdate={(qa) => onUpdateQuestao(index, qa)} onDelete={() => onDeleteQuestao(index)} />
        ))}
      </Stack>
      {questoes.length === 0 && (<Alert severity="warning" sx={{ mt: 2 }}>Você excluiu todas as questões.</Alert>)}
      <Divider sx={{ my: 4 }}><Chip label="Ações Finais" /></Divider>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
          <Button variant="contained" color="primary" onClick={() => setPreparandoPdf('aluno')} disabled={!!preparandoPdf || questoes.length === 0} startIcon={<PictureAsPdfIcon />}>
            {preparandoPdf === 'aluno' ? <CircularProgress size={24} color="inherit" /> : 'Exportar Prova do Aluno'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => setPreparandoPdf('professor')} disabled={!!preparandoPdf || questoes.length === 0} startIcon={<PictureAsPdfIcon />}>
            {preparandoPdf === 'professor' ? <CircularProgress size={24} /> : 'Exportar Gabarito'}
          </Button>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 3 }}><Button variant="text" onClick={onReset} startIcon={<AddCircleOutlineIcon />}>Gerar Nova Prova</Button></Box>

      {/* ATUALIZAÇÃO FINAL: O componente de PDF só é renderizado no DOM quando estamos preparando para exportar */}
      {preparandoPdf && (
        <Box sx={{ position: 'fixed', top: 0, left: '-2000px', zIndex: -1 }}>
          <ConteudoProva isGabarito={preparandoPdf === 'professor'} questoes={questoes} nomeProfessor={nomeProfessor} dadosFormulario={dadosFormulario} />
        </Box>
      )}
    </>
  );
}