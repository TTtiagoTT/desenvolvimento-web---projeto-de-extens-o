import React, { useState } from 'react';
import { CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography, Box, Grid, Paper } from '@mui/material';
import FormularioGerador from './components/FormularioGerador';
import ListaQuestoes from './components/ListaQuestoes';
import axios from 'axios';

// Tema
let theme = createTheme({
  palette: {
    primary: { main: '#0052cc' },
    secondary: { main: '#D32F2F' },
    background: { default: '#f7f9fc' },
    success: { main: '#2e7d32' }
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, button: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', borderRadius: 8, padding: '10px 24px', boxShadow: 'none',
          transition: 'background-color 0.3s ease, transform 0.1s ease',
          ':hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' }
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8, } } },
    MuiChip: {
        styleOverrides: {
            root: { backgroundColor: 'rgba(0, 82, 204, 0.08)', color: '#0052cc', fontWeight: 500 }
        }
    }
  },
});
theme = responsiveFontSizes(theme);

export default function App() {
  const [questoes, setQuestoes] = useState([]);
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dadosForm, setDadosForm] = useState(null);

  const handleGerarQuestoes = async (dadosDoFormulario) => {
    setCarregando(true);
    setErro('');
    setQuestoes([]);
    setNomeProfessor(dadosDoFormulario.nomeProfessor);
    const urlApi = 'http://127.0.0.1:8000/gerar-questoes';
    try {
      const response = await axios.post(urlApi, dadosDoFormulario);
      setQuestoes(response.data.questoes); 
      setDadosForm(dadosDoFormulario); 
    } catch (error) {
      if (error.response) { setErro(`Erro do servidor: ${error.response.data.detail || 'Não foi possível gerar as questões.'}`);
      } else if (error.request) { setErro("Não foi possível se conectar ao servidor. O back-end está rodando?");
      } else { setErro("Ocorreu um erro inesperado. Tente novamente."); }
    } finally {
      setCarregando(false);
    }
  };

  const handleUpdateQuestao = (index, questaoAtualizada) => {
    const novasQuestoes = [...questoes]; 
    novasQuestoes[index] = questaoAtualizada;
    setQuestoes(novasQuestoes);
  };

  const handleDeleteQuestao = (index) => {
    const novasQuestoes = questoes.filter((_, i) => i !== index);
    setQuestoes(novasQuestoes);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100%'
      }}>
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Grid container justifyContent="center">
            <Grid xs={11} sm={10} md={8} lg={7} xl={6}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '190px', height: 'auto', marginBottom: '16px' }} />
                <Typography variant="h4" component="h1" gutterBottom>Gerador de Provas</Typography>
                <Typography variant="subtitle1" color="text.secondary">Crie avaliações personalizadas com o poder da IA</Typography>
              </Box>
              <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%' }}>
                {!dadosForm ? (
                    <FormularioGerador onSubmit={handleGerarQuestoes} carregando={carregando} />
                ) : (
                    <ListaQuestoes
                        questoes={questoes}
                        nomeProfessor={nomeProfessor}
                        dadosFormulario={dadosForm}
                        onReset={() => setDadosForm(null)}
                        onUpdateQuestao={handleUpdateQuestao}
                        onDeleteQuestao={handleDeleteQuestao}
                    />
                )}
                {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <Box component="footer" sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Powered by</Typography>
              <img src="/gemini_logo.png" alt="Logo da Tecnologia" style={{ width: '60px', height: 'auto' }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}