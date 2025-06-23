import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import RenderizadorMarkdown from './RenderizadorMarkdown';

// Este é um novo sub-componente para gerar as linhas da resposta.
// Colocamos ele aqui para manter tudo organizado.
const LinhasDeResposta = ({ textoGabarito }) => {
  // Lógica para calcular o número de linhas dinamicamente.
  const caracteresPorLinha = 85; // Média de caracteres por linha em uma folha A4. Ajuste se necessário.
  const linhasMinimas = 4; // Um número mínimo de linhas para garantir espaço.
  
  // Calcula o número de linhas, garantindo que seja pelo menos o mínimo.
  const numLinhas = Math.max(
    linhasMinimas, 
    Math.ceil((textoGabarito || "").length / caracteresPorLinha) + 1 // +1 linha de margem
  );

  // Cria um array com o tamanho calculado e renderiza uma linha para cada item.
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
  const { tema } = dadosFormulario;

  return (
    <Box 
      id={isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf"} // O ID agora é dinâmico
      sx={{ 
        backgroundColor: 'white', 
        color: 'black', 
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box'
      }}
    >
      {/* --- CABEÇALHO (sem alterações) --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', pb: 2, mb: 2 }}>
        <img src="/logo.png" alt="Logotipo" style={{ width: '80px', height: 'auto' }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Data: _______/_______/___________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Nota final: _________ de _________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 2 }}>Disciplina: {tema}</Typography>
        </Box>
      </Box>

      {/* --- INFORMAÇÕES DO ALUNO E PROFESSOR (sem alterações) --- */}
      {!isGabarito && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 4, mb: 3 }}>
          <Typography sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', mr: 1, fontWeight: 'bold' }}>Nome do Aluno:</Typography>
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid black' }} />
        </Box>
      )}
      <Typography sx={{fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 1 }}>
        Professor(a): {nomeProfessor}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* --- RENDERIZAÇÃO DAS QUESTÕES (LÓGICA PRINCIPAL) --- */}
      {questoes.map((q, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          {/* Pergunta */}
          <RenderizadorMarkdown
            text={`**Questão ${index + 1}:** ${q.pergunta}`}
            sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', lineHeight: 1.6 }}
          />

          {/* Alternativas (se for de múltipla escolha) */}
          {q.tipo === 'multipla_escolha' && (
            <Box sx={{ mt: 1, pl: 2 }}>
              {q.alternativas.map((alt, i) => (
                <Typography key={i} sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', my: 0.5 }}>
                  {alt}
                </Typography>
              ))}
            </Box>
          )}

          {/* Resposta (se for o gabarito do professor) */}
          {isGabarito && (
            <RenderizadorMarkdown 
              text={`**Resposta:** ${q.resposta_correta || q.resposta_esperada}`}
              sx={{ mt: 2, fontFamily: '"Times New Roman", serif', fontSize: '12pt', color: '#005500' }}
            />
          )}

          {/* Linhas para resposta (se for prova do aluno e questão dissertativa) */}
          {!isGabarito && q.tipo === 'dissertativa' && (
             <LinhasDeResposta textoGabarito={q.resposta_esperada} />
          )}
        </Box>
      ))}
    </Box>
  );
}