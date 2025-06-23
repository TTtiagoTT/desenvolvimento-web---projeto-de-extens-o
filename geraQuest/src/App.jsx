import React, { useState } from 'react';
import { Container, CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography, Box } from '@mui/material';
import FormularioGerador from './components/FormularioGerador';
import ListaQuestoes from './components/ListaQuestoes';
import axios from 'axios';

// --- NOVO: Personalização do Tema ---
let theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Um tom de azul padrão do Material-UI
    },
    secondary: {
      main: '#dc004e', // Um tom de rosa/vermelho para secundário
    },
    background: {
      default: '#f4f6f8', // Um cinza claro para o fundo
      paper: '#fff', // Branco para os "papers" (cards/conteúdo)
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Fonte padrão
    h5: {
      fontWeight: 500,
      marginBottom: '1em',
      color: '#333',
    },
    subtitle1: {
      color: '#555',
      marginBottom: '0.5em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Deixa o texto dos botões como está (sem uppercase)
          borderRadius: '8px', // Bordas mais arredondadas nos botões
          padding: '10px 20px',
        },
        containedPrimary: {
          color: '#fff', // Texto branco nos botões primários
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Usar sempre a variante "outlined" nos TextFields
        margin: 'normal', // Adicionar um pouco de margem padrão
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Bordas mais arredondadas nos Papers
          padding: '24px', // Aumentar o padding interno dos Papers
        },
      },
    },
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
    setDadosForm(dadosDoFormulario);

    const urlApi = 'http://127.0.0.1:8000/gerar-questoes';

    try {
      const response = await axios.post(urlApi, dadosDoFormulario);
      setQuestoes(response.data.questoes);
    } catch (error) {
      console.error("Ocorreu um erro ao chamar a API:", error);
      if (error.response) {
        setErro(`Erro do servidor: ${error.response.data.detail || 'Não foi possível gerar as questões.'}`);
      } else if (error.request) {
        setErro("Não foi possível se conectar ao servidor. O back-end está rodando?");
      } else {
        setErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: { xs: 3, sm: 5 }, mb: 4 }}> {/* Aumentei um pouco a margem superior */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '120px', height: 'auto', marginBottom: '1em' }} /> {/* Adicionei margem abaixo do logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}> {/* Reduzi um pouco a margem superior deste Box */}
            <Typography variant="body2" color="text.secondary">Powered by</Typography>
            <img src="/powered-by-logo.png" alt="Logo da Tecnologia" style={{ width: '80px', height: 'auto' }} />
          </Box>
        </Box>

        {/* O formulário já se beneficiará do tema */}
        <FormularioGerador onSubmit={handleGerarQuestoes} carregando={carregando} />

        {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}

        {questoes.length > 0 && dadosForm && (
          <ListaQuestoes
            questoes={questoes}
            nomeProfessor={nomeProfessor}
            dadosFormulario={dadosForm}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}