import React, { useState } from 'react';
// Garantindo que todos os imports necessários estão aqui
import { CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography, Box, Grid, Paper } from '@mui/material';
import FormularioGerador from './components/FormularioGerador';
import ListaQuestoes from './components/ListaQuestoes';
import axios from 'axios';

// --- TEMA PROFISSIONAL 100% CORRIGIDO ---
let theme = createTheme({
  palette: {
    primary: { main: '#0052cc' },
    secondary: { main: '#D32F2F' },
    background: { default: '#f7f9fc' },
    success: { main: '#2e7d32' }
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    button: { fontWeight: 600, }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'background-color 0.3s ease, transform 0.1s ease',
          ':hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          }
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
    },
    MuiOutlinedInput: {
      styleOverrides: {
          root: {
              borderRadius: 8,
          },
      }
    },
    MuiChip: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(0, 82, 204, 0.08)',
                color: '#0052cc', 
                fontWeight: 500,
            }
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
    // ... (a função handleGerarQuestoes continua a mesma)
    setCarregando(true);
    setErro('');
    setQuestoes([]);
    setNomeProfessor(dadosDoFormulario.nomeProfessor);
    setDadosForm(dadosDoFormulario);
    const urlApi = 'http://127.0.0.1:8000/gerar-questoes';
    try {
      const response = await axios.post(urlApi, dadosDoFormulario);
      setQuestoes(response.data.questoes);
    } catch (error) {
      console.error("Ocorreu um erro ao chamar a API:", error);
      if (error.response) { setErro(`Erro do servidor: ${error.response.data.detail || 'Não foi possível gerar as questões.'}`);
      } else if (error.request) { setErro("Não foi possível se conectar ao servidor. O back-end está rodando?");
      } else { setErro("Ocorreu um erro inesperado. Tente novamente."); }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', p: 2, backgroundColor: 'background.default' }}>
        <Grid item xs={11} sm={10} md={8} lg={7} xl={6}>
          
          {/* --- Bloco 1: Cabeçalho da Página (Fora do Paper) --- */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '190px', height: 'auto', marginBottom: '30px' }} />
            <Typography variant="h4" component="h1" gutterBottom>Gerador de Provas</Typography>
            <Typography variant="subtitle1" color="text.secondary">Crie avaliações personalizadas com o poder da IA</Typography>
          </Box>

          {/* --- Bloco 2: Conteúdo Principal da Aplicação (Dentro do Paper) --- */}
          <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%', borderRadius: 3 }}>
            
            {!dadosForm ? (
                <FormularioGerador onSubmit={handleGerarQuestoes} carregando={carregando} />
            ) : (
                <ListaQuestoes
                    questoes={questoes}
                    nomeProfessor={nomeProfessor}
                    dadosFormulario={dadosForm}
                    onReset={() => setDadosForm(null)}
                />
            )}
            
            {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}

          </Paper>

          {/* O "Powered by" continua no final, fora dos blocos principais */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>Powered by</Typography>
              <img src="/gemini_logo.png" alt="Logo da Tecnologia" style={{ width: '80px', height: 'auto' }} />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}