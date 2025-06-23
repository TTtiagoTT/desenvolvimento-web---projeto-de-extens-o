import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import RenderizadorMarkdown from './RenderizadorMarkdown';

// Este é um sub-componente para gerar as linhas da resposta.
const LinhasDeResposta = ({ textoGabarito }) => {
  const caracteresPorLinha = 85; 
  const linhasMinimas = 4;
  
  const numLinhas = Math.max(
    linhasMinimas, 
    Math.ceil((textoGabarito || "").length / caracteresPorLinha) + 1
  );

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      {Array.from({ length: numLinhas }).map((_, i) => (
        <Box key={i} sx={{ borderBottom: '1px solid #999', height: '24px' }} />
      ))}
    </Box>
  );
};


// O componente principal agora recebe a lista de "questoes".
export default function ConteudoProva({ questoes, nomeProfessor, dadosFormulario, isGabarito = false }) {
  // Verificação para garantir que dadosFormulario não é nulo
  const tema = dadosFormulario ? dadosFormulario.tema : 'Tema não definido';
  
  // ATUALIZADO: O ID é definido aqui e usado no Box abaixo
  const id = isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf";
  const titulo = isGabarito ? "Avaliação de Conhecimentos (Gabarito)" : "Avaliação de Conhecimentos";

  return (
    // ATUALIZADO: Adicionando o 'id' dinâmico de volta ao Box principal.
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', pb: 2, mb: 2 }}>
        <img src="/logo.png" alt="Logotipo" style={{ width: '80px', height: 'auto' }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Data: _______/_______/___________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Nota: _________________</Typography>
        </Box>
      </Box>

      {!isGabarito && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 4, mb: 3 }}>
          <Typography sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', mr: 1, fontWeight: 'bold' }}>Nome do Aluno:</Typography>
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid black' }} />
        </Box>
      )}
      <Typography sx={{fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 1 }}>Professor(a): {nomeProfessor}</Typography>
      <Typography sx={{fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 2 }}>Disciplina: {tema}</Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontFamily: '"Times New Roman", serif', fontWeight: 'bold', fontSize: '16pt', mb: 4, }}>{titulo}</Typography>
      
      {questoes.map((q, index) => (
        <Box key={index} sx={{ mb: 2, pageBreakInside: 'avoid' }}> {/* pageBreakInside ajuda na quebra de página do PDF */}
          <RenderizadorMarkdown text={`**Questão ${index + 1}:** ${q.pergunta}`} sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', lineHeight: 1.6 }}/>
          {q.tipo === 'multipla_escolha' && (
            <Box sx={{ mt: 1, pl: 2 }}>
              {(q.alternativas || []).map((alt, i) => (<Typography key={i} sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', my: 0.5 }}>{alt}</Typography>))}
            </Box>
          )}
          {isGabarito && (<RenderizadorMarkdown text={`**Resposta:** ${q.resposta_correta || q.resposta_esperada}`} sx={{ mt: 2, fontFamily: '"Times New Roman", serif', fontSize: '12pt', color: '#005500' }}/>)}
          {!isGabarito && q.tipo === 'dissertativa' && (<LinhasDeResposta textoGabarito={q.resposta_esperada} />)}
        </Box>
      ))}
    </Box>
  );
}