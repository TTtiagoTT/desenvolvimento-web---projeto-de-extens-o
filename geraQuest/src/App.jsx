import React, { useState, useEffect } from 'react';
import {
  CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography,
  Box, Grid, Paper, TextField, Button, CircularProgress, Tabs, Tab, IconButton,
  Stack, Divider, Chip, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, FormGroup, FormControlLabel, Checkbox, ListItemSecondaryAction
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Icons
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';


// --- TEMA (sem alterações) ---
let theme = createTheme({
  palette: {
    primary: { main: '#0052cc' },
    secondary: { main: '#D32F2F' },
    background: { default: '#f7f9fc' },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, button: { fontWeight: 600 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8, padding: '10px 24px' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiChip: { styleOverrides: { root: { backgroundColor: 'rgba(0, 82, 204, 0.08)', color: '#0052cc', fontWeight: 500 } } }
  },
});
theme = responsiveFontSizes(theme);


// ===================================================================
// ===== DEFINIÇÃO DOS SUB-COMPONENTES (VERSÃO LIMPA E ÚNICA) =====
// ===================================================================

const RenderizadorMarkdown = ({ text, sx }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
  return (
    <Typography component="div" sx={sx}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Typography component="span" key={index} sx={{ fontWeight: 'bold' }}>{part.substring(2, part.length - 2)}</Typography>;
        }
        return <Typography component="span" key={index}>{part}</Typography>;
      })}
    </Typography>
  );
};

const ConteudoProva = ({ questoes, nomeProfessor, dadosFormulario, isGabarito = false }) => {
  const LinhasDeResposta = ({ textoGabarito }) => {
    const numLinhas = Math.max(4, Math.ceil((textoGabarito || "").length / 85) + 1);
    return <Box sx={{ mt: 2, mb: 3 }}>{Array.from({ length: numLinhas }).map((_, i) => <Box key={i} sx={{ borderBottom: '1px solid #999', height: '24px' }} />)}</Box>;
  };
  const id = isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf";
  const titulo = isGabarito ? "Avaliação de Conhecimentos (Gabarito)" : "Avaliação de Conhecimentos";
  return (
    <Box id={id} sx={{ backgroundColor: 'white', color: 'black', width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', pb: 2, mb: 2 }}>
        <img src="/logo.png" alt="Logotipo" style={{ width: '80px', height: 'auto' }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Data: _______/_______/___________</Typography>
          <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>Nota: _________________</Typography>
        </Box>
      </Box>
      {!isGabarito && (<Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 4, mb: 3 }}><Typography sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', mr: 1, fontWeight: 'bold' }}>Nome do Aluno:</Typography><Box sx={{ flexGrow: 1, borderBottom: '1px solid black' }} /></Box>)}
      <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 1 }}>Professor(a): {nomeProfessor}</Typography>
      <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif', fontSize: '12pt', mb: 2 }}>Disciplina: {dadosFormulario.tema}</Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontFamily: '"Times New Roman", serif', fontWeight: 'bold', fontSize: '16pt', mb: 4, }}>{titulo}</Typography>
      {questoes.map((q, index) => (
        <Box key={index} sx={{ mb: 2, pageBreakInside: 'avoid' }}>
          <RenderizadorMarkdown text={`**Questão ${index + 1}:** ${q.pergunta}`} sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', lineHeight: 1.6 }} />
          {q.tipo === 'multipla_escolha' && (<Box sx={{ mt: 1, pl: 2 }}>{(q.alternativas || []).map((alt, i) => (<Typography key={i} sx={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', my: 0.5 }}>{alt}</Typography>))}</Box>)}
          {isGabarito && (<RenderizadorMarkdown text={`**Resposta:** ${q.resposta_correta || q.resposta_esperada}`} sx={{ mt: 2, fontFamily: '"Times New Roman", serif', fontSize: '12pt', color: '#005500' }} />)}
          {!isGabarito && q.tipo === 'dissertativa' && (<LinhasDeResposta textoGabarito={q.resposta_esperada} />)}
        </Box>
      ))}
    </Box>
  );
};

const QuestaoEditavel = ({ questao, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestao, setEditedQuestao] = useState(questao);
  const handleSave = () => { onUpdate(editedQuestao); setIsEditing(false); };
  const handleCancel = () => { setEditedQuestao(questao); setIsEditing(false); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "alternativas") {
      setEditedQuestao({ ...editedQuestao, [name]: value.split('\n') });
    } else { setEditedQuestao({ ...editedQuestao, [name]: value }); }
  };
  if (isEditing) {
    return (
      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'action.hover' }}>
        <TextField label={`Pergunta ${index + 1}`} name="pergunta" value={editedQuestao.pergunta || ''} onChange={handleChange} multiline fullWidth variant="filled" margin="normal" />
        {editedQuestao.tipo === 'multipla_escolha' ? (
          <>
            <TextField label="Alternativas (uma por linha)" name="alternativas" value={(editedQuestao.alternativas || []).join('\n')} onChange={handleChange} multiline fullWidth variant="filled" margin="normal" />
            <TextField label="Resposta Correta (ex: A)" name="resposta_correta" value={editedQuestao.resposta_correta || ''} onChange={handleChange} fullWidth variant="filled" margin="normal" />
          </>
        ) : (
          <TextField label="Resposta Esperada (Gabarito)" name="resposta_esperada" value={editedQuestao.resposta_esperada || ''} onChange={handleChange} multiline fullWidth variant="filled" margin="normal" />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}><Button startIcon={<CloseIcon />} onClick={handleCancel} color="inherit">Cancelar</Button><Button variant="contained" startIcon={<CheckIcon />} onClick={handleSave}>Salvar</Button></Stack>
      </Box>
    );
  }
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <RenderizadorMarkdown text={`**Questão ${index + 1}:** ${questao.pergunta}`} sx={{ flexGrow: 1, pr: 1, textAlign: 'left' }} />
        <Box><IconButton aria-label="Editar" size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="small" /></IconButton><IconButton aria-label="Excluir" size="small" onClick={() => onDelete()}><DeleteIcon color="error" fontSize="small" /></IconButton></Box>
      </Stack>
      {questao.tipo === 'multipla_escolha' && (<Box sx={{ mt: 1, pl: 2, textAlign: 'left' }}>{(questao.alternativas || []).map((alt, i) => <Typography key={i} variant="body2">{alt}</Typography>)}</Box>)}
    </Box>
  );
};

const ListaQuestoes = ({ questoes, nomeProfessor, dadosFormulario, onReset, onUpdateQuestao, onDeleteQuestao }) => {
  const [preparandoPdf, setPreparandoPdf] = useState(null);
  useEffect(() => {
    if (!preparandoPdf) return;
    const isGabarito = preparandoPdf === 'professor';
    const elementId = isGabarito ? "prova-professor-pdf" : "prova-aluno-pdf";
    const timer = setTimeout(() => {
      const input = document.getElementById(elementId);
      if (!input) { setPreparandoPdf(null); return; }
      const fileName = `${isGabarito ? 'Gabarito' : 'Prova'}_${dadosFormulario.tema.replace(/\s+/g, '_')}.pdf`;
      html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = totalImgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        while (heightLeft > 0) {
          position -= pdf.internal.pageSize.getHeight();
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(fileName);
      }).finally(() => setPreparandoPdf(null));
    }, 100);
    return () => clearTimeout(timer);
  }, [preparandoPdf, dadosFormulario, questoes, nomeProfessor]);
  return (
    <>
      <Box sx={{ textAlign: 'center' }}><Typography variant="h5" component="h2" gutterBottom>Revisão da Prova</Typography><Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Visualize, edite ou exclua as questões geradas.</Typography></Box>
      <Divider sx={{ mb: 3 }} />
      <Stack spacing={3}>{questoes.map((q, index) => (<QuestaoEditavel key={q.pergunta + index} index={index} questao={q} onUpdate={(qa) => onUpdateQuestao(index, qa)} onDelete={() => onDeleteQuestao(index)} />))}</Stack>
      {questoes.length === 0 && (<Alert severity="warning" sx={{ mt: 2 }}>Você excluiu todas as questões.</Alert>)}
      <Divider sx={{ my: 4 }}><Chip label="Ações Finais" /></Divider>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
        <Button variant="contained" color="primary" onClick={() => setPreparandoPdf('aluno')} disabled={!!preparandoPdf || questoes.length === 0} startIcon={<PictureAsPdfIcon />}>{preparandoPdf === 'aluno' ? <CircularProgress size={24} color="inherit" /> : 'Exportar Prova do Aluno'}</Button>
        <Button variant="outlined" color="primary" onClick={() => setPreparandoPdf('professor')} disabled={!!preparandoPdf || questoes.length === 0} startIcon={<PictureAsPdfIcon />}>{preparandoPdf === 'professor' ? <CircularProgress size={24} /> : 'Exportar Gabarito'}</Button>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 3 }}><Button variant="text" onClick={onReset} startIcon={<AddCircleOutlineIcon />}>Gerar Nova Prova</Button></Box>
      {preparandoPdf && (<Box sx={{ position: 'fixed', top: 0, left: '-2000px', zIndex: -1 }}><ConteudoProva isGabarito={preparandoPdf === 'professor'} questoes={questoes} nomeProfessor={nomeProfessor} dadosFormulario={dadosFormulario} /></Box>)}
    </>
  );
};

const FormularioGerador = ({ onSubmit, carregando, nomeProfessor }) => {
  const [tiposSelecionados, setTiposSelecionados] = useState({ multipla_escolha: true, dissertativa: false });
  const [qtdMultipla, setQtdMultipla] = useState(5);
  const [qtdDissertativa, setQtdDissertativa] = useState(3);
  const handleTipoChange = (event) => { setTiposSelecionados({ ...tiposSelecionados, [event.target.name]: event.target.checked }); };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa) { alert("Selecione ao menos um tipo de questão."); return; }
    onSubmit({
      tema: event.target.tema.value,
      serie: event.target.serie.value,
      quantidadeMultipla: tiposSelecionados.multipla_escolha ? Number(qtdMultipla) : 0,
      quantidadeDissertativa: tiposSelecionados.dissertativa ? Number(qtdDissertativa) : 0,
    });
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" component="h3" gutterBottom>Informações da Prova</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField margin="dense" label="Nome do Professor(a)" value={nomeProfessor} required fullWidth disabled /></Grid>
        <Grid item xs={12} md={6}><TextField name="tema" margin="dense" label="Tema da Aula" required fullWidth /></Grid>
        <Grid item xs={12}><TextField name="serie" margin="dense" label="Ano/Série" required fullWidth /></Grid>
      </Grid>
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Estrutura da Prova</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}><FormGroup row><FormControlLabel control={<Checkbox checked={tiposSelecionados.multipla_escolha} onChange={handleTipoChange} name="multipla_escolha" />} label="Múltipla Escolha" /><FormControlLabel control={<Checkbox checked={tiposSelecionados.dissertativa} onChange={handleTipoChange} name="dissertativa" />} label="Dissertativa" /></FormGroup></Grid>
        {tiposSelecionados.multipla_escolha && (<Grid item xs={12} sm={6}><TextField margin="dense" label="Qtd. Múltipla Escolha" type="number" value={qtdMultipla} onChange={(e) => setQtdMultipla(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth /></Grid>)}
        {tiposSelecionados.dissertativa && (<Grid item xs={12} sm={6}><TextField margin="dense" label="Qtd. Dissertativas" type="number" value={qtdDissertativa} onChange={(e) => setQtdDissertativa(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth /></Grid>)}
      </Grid>
      <Box sx={{ mt: 4 }}><Button type="submit" variant="contained" disabled={carregando} fullWidth startIcon={<AutoFixHighIcon />} sx={{ height: '56px', fontSize: '1rem' }}>{carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Prova com IA'}</Button></Box>
    </Box>
  );
};

const TelaAutenticacao = ({ onLoginSuccess }) => {
  const [aba, setAba] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    try {
      const response = await axios.post('http://127.0.0.1:8000/token', params);
      onLoginSuccess(response.data.access_token);
    } catch (error) {
      setErro('E-mail ou senha incorretos.');
    }
  };

  const handleCadastro = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/professores/', { nome, email, password });
      await handleLogin();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao cadastrar.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    if (aba === 0) {
      await handleLogin();
    } else {
      await handleCadastro();
    }
    setCarregando(false);
  };

  return (
    <>
      <Tabs value={aba} onChange={(e, novaAba) => setAba(novaAba)} centered sx={{ mb: 3 }}><Tab label="Entrar" /><Tab label="Cadastrar" /></Tabs>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {aba === 1 && (<Grid item xs={12}><TextField label="Nome Completo" fullWidth required value={nome} onChange={(e) => setNome(e.target.value)} /></Grid>)}
          <Grid item xs={12}><TextField label="E-mail" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField label="Senha" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} /></Grid>
          <Grid item xs={12}><Button type="submit" variant="contained" fullWidth disabled={carregando} sx={{ height: '56px' }}>{carregando ? <CircularProgress size={24} /> : (aba === 0 ? 'Entrar' : 'Cadastrar e Entrar')}</Button></Grid>
          {erro && (<Grid item xs={12}><Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography></Grid>)}
        </Grid>
      </Box>
    </>
  );
};

const TelaHistorico = ({ token, onVoltar }) => {
  const [provas, setProvas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [baixandoId, setBaixandoId] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      setCarregando(true);
      setErro('');
      try {
        const response = await axios.get('http://127.0.0.1:8000/professores/me/provas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProvas(response.data);
      } catch (error) {
        setErro('Não foi possível carregar o histórico de provas.');
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setCarregando(false);
      }
    };
    fetchHistorico();
  }, [token]);

  const handleDownload = async (prova) => {
    setBaixandoId(prova.id);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/provas/${prova.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${prova.titulo.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert('Erro ao baixar o PDF.');
    } finally {
      setBaixandoId(null);
    }
  };

  if (carregando) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (erro) return <Alert severity="error">{erro}</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onVoltar} sx={{ mb: 2 }}>Voltar ao Gerador</Button>
      <Typography variant="h5" component="h2" gutterBottom align="center">Meu Histórico de Provas</Typography>
      <Divider sx={{ mb: 2 }} />
      {provas.length > 0 ? (
        <List>
          {provas.map((prova) => (
            <ListItem key={prova.id} divider>
              <ListItemAvatar><Avatar><ArticleIcon /></Avatar></ListItemAvatar>
              <ListItemText
                primary={prova.titulo}
                secondary={`Criada em: ${new Date(prova.data_criacao).toLocaleDateString('pt-BR')}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDownload(prova)} disabled={baixandoId === prova.id}>
                  {baixandoId === prova.id ? <CircularProgress size={24} /> : <DownloadIcon />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">Você ainda não gerou nenhuma prova.</Alert>
      )}
    </Box>
  );
};

const TelaPrincipal = ({ usuario, token, onLogout }) => {
  const [view, setView] = useState('generator'); // 'generator' ou 'history'
  const [questoes, setQuestoes] = useState([]);
  const [dadosFormulario, setDadosFormulario] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleGerarQuestoes = async (dadosDoForm) => {
    setCarregando(true);
    setErro('');
    setQuestoes([]);
    try {
      const response = await axios.post('http://127.0.0.1:8000/gerar-prova', dadosDoForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestoes(response.data.questoes_geradas);
      setDadosFormulario(dadosDoForm);
    } catch (error) {
      setErro(error.response?.data?.detail || "Ocorreu um erro ao gerar a prova.");
    } finally {
      setCarregando(false);
    }
  };

  const handleReset = () => {
    setQuestoes([]);
    setDadosFormulario(null);
  };

  if (view === 'history') {
    return <TelaHistorico token={token} onVoltar={() => setView('generator')} />;
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2">Olá, {usuario.nome.split(' ')[0]}</Typography>
        <Box>
          <Button onClick={() => setView('history')} variant="text" startIcon={<HistoryIcon />}>Histórico</Button>
          <Button onClick={onLogout} size="small" variant="outlined" sx={{ ml: 1 }}>Sair</Button>
        </Box>
      </Box>
      {!dadosFormulario ? (
        <FormularioGerador onSubmit={handleGerarQuestoes} carregando={carregando} nomeProfessor={usuario.nome} />
      ) : (
        <ListaQuestoes
          questoes={questoes}
          nomeProfessor={usuario.nome}
          dadosFormulario={dadosFormulario}
          onReset={handleReset}
          onUpdateQuestao={(index, questao) => {
            const novasQuestoes = [...questoes];
            novasQuestoes[index] = questao;
            setQuestoes(novasQuestoes);
          }}
          onDeleteQuestao={(index) => {
            setQuestoes(questoes.filter((_, i) => i !== index));
          }}
        />
      )}
      {erro && <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>}
    </>
  );
};


// --- COMPONENTE MESTRE: App ---
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUsuario = async () => {
      if (token) {
        setAuthLoading(true);
        try {
          const response = await axios.get('http://127.0.0.1:8000/professores/me/', { headers: { 'Authorization': `Bearer ${token}` } });
          setUsuario(response.data);
        } catch (error) {
          handleLogout();
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };
    fetchUsuario();
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={10} md={8} lg={7} xl={6}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '190px', height: 'auto', marginBottom: '16px' }} />
                <Typography variant="h4" component="h1" gutterBottom>Gerador de Provas</Typography>
                <Typography variant="subtitle1" color="text.secondary">Crie avaliações personalizadas com o poder da IA</Typography>
              </Box>
              <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%' }}>
                {authLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>)
                  : !usuario ? (<TelaAutenticacao onLoginSuccess={handleLoginSuccess} />)
                    : (<TelaPrincipal usuario={usuario} token={token} onLogout={handleLogout} />)}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Powered by</Typography>
            <img src="/gemini_logo.png" alt="Logo da Tecnologia" style={{ width: '60px', height: 'auto' }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}