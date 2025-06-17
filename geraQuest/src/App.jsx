import React, { useState } from 'react';
import { Container, CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography, Box } from '@mui/material';
import FormularioGerador from './components/FormularioGerador';
import ListaQuestoes from './components/ListaQuestoes';
import axios from 'axios'; // Importação que finalmente será usada!

let theme = createTheme();
theme = responsiveFontSizes(theme);

export default function App() {
  const [provaAluno, setProvaAluno] = useState('');
  const [provaProfessor, setProvaProfessor] = useState('');
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dadosForm, setDadosForm] = useState(null);

  const handleGerarQuestoes = async (dadosDoFormulario) => {
    setCarregando(true);
    setErro('');
    setProvaAluno('');
    setProvaProfessor('');
    setNomeProfessor(dadosDoFormulario.nomeProfessor);
    setDadosForm(dadosDoFormulario);

    // --- INÍCIO DA MUDANÇA REAL ---
    // O bloco de simulação foi removido e substituído por isto:
    
    // URL da nossa API que está rodando em http://127.0.0.1:8000
    const urlApi = 'http://127.0.0.1:8000/gerar-questoes';

    try {
      console.log("Enviando dados para a API:", dadosDoFormulario);
      
      // Faz a chamada POST para o nosso back-end FastAPI
      const response = await axios.post(urlApi, dadosDoFormulario);

      console.log("Resposta recebida da API:", response.data);

      // Atualiza o estado com os dados REAIS vindos da IA
      setProvaAluno(response.data.prova_aluno);
      setProvaProfessor(response.data.prova_professor);

    } catch (error) {
      console.error("Ocorreu um erro ao chamar a API:", error);
      // Exibe uma mensagem de erro mais útil para o usuário
      if (error.response) {
        setErro(`Erro do servidor: ${error.response.data.detail || 'Não foi possível gerar as questões.'}`);
      } else if (error.request) {
        setErro("Não foi possível se conectar ao servidor. O back-end está rodando?");
      } else {
        setErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      // Garante que o estado de "carregando" seja desativado, mesmo se der erro
      setCarregando(false);
    }
    // --- FIM DA MUDANÇA REAL ---
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', mb: 4 }}>
          <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '166px', height: 'auto' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Powered by
            </Typography>
            <img src="/gemini_logo.png" alt="Logo da Tecnologia" style={{ width: '80px', height: 'auto' }} />
          </Box>
        </Box>

        <FormularioGerador onSubmit={handleGerarQuestoes} carregando={carregando} />

        {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}

        {provaAluno && dadosForm && (
          <ListaQuestoes
            provaParaAluno={provaAluno}
            provaParaProfessor={provaProfessor}
            nomeProfessor={nomeProfessor}
            dadosFormulario={dadosForm} 
          />
        )}
      </Container>
    </ThemeProvider>
  );
}