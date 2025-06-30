import React, { useState, useEffect } from 'react';
import {
  CssBaseline, createTheme, ThemeProvider, responsiveFontSizes, Typography,
  Box, Grid, Paper, TextField, Button, CircularProgress, Tabs, Tab, IconButton,
  Stack, Divider, Chip, Alert, FormGroup, FormControlLabel, Checkbox,
  ListItemSecondaryAction
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

// Tema visual mantido
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
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8, padding: '10px 24px' } },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiChip: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(0, 82, 204, 0.08)', color: '#0052cc', fontWeight: 500 }
      }
    }
  },
});
theme = responsiveFontSizes(theme);

// --- COMPONENTES REAIS (Integrados a partir dos seus arquivos) ---

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
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button startIcon={<CloseIcon />} onClick={handleCancel} color="inherit">Cancelar</Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={handleSave}>Salvar</Button>
        </Stack>
      </Box>
    );
  }
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <RenderizadorMarkdown text={`**Questão ${index + 1}:** ${questao.pergunta}`} sx={{ flexGrow: 1, pr: 1, textAlign: 'left' }} />
        <Box>
          <IconButton aria-label="Editar" size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="small" /></IconButton>
          <IconButton aria-label="Excluir" size="small" onClick={() => onDelete()}><DeleteIcon color="error" fontSize="small" /></IconButton>
        </Box>
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
      <Box sx={{ mt: 4 }}><Button type="submit" variant="contained" disabled={carregando || (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa)} fullWidth startIcon={<AutoFixHighIcon />} sx={{ height: '56px', fontSize: '1rem' }}>{carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Prova com IA'}</Button></Box>
    </Box>
  );
};


// --- Componente da Tela de Autenticação ---
const TelaAutenticacao = ({ onLoginSuccess }) => {
  const [aba, setAba] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const handleLogin = async () => {
    setCarregando(true); setErro('');
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    try {
      const response = await axios.post('http://127.0.0.1:8000/token', params);
      onLoginSuccess(response.data.access_token);
    } catch (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.');
    } finally { setCarregando(false); }
  };
  const handleCadastro = async () => {
    setCarregando(true); setErro('');
    try {
      await axios.post('http://127.0.0.1:8000/professores/', { nome, email, password });
      await handleLogin();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao cadastrar.');
    } finally { setCarregando(false); }
  };
  const handleSubmit = (e) => { e.preventDefault(); if (aba === 0) handleLogin(); else handleCadastro(); };
  return (
    <>
      <Tabs value={aba} onChange={(e, novaAba) => setAba(novaAba)} centered sx={{ mb: 3 }}><Tab label="Entrar" /><Tab label="Cadastrar" /></Tabs>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {aba === 1 && (<Grid item xs={12}><TextField label="Nome Completo" fullWidth required value={nome} onChange={(e) => setNome(e.target.value)} /></Grid>)}
          <Grid item xs={12}><TextField label="E-mail" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField label="Senha" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} /></Grid>
          <Grid item xs={12}><Button type="submit" variant="contained" fullWidth disabled={carregando} sx={{ height: '56px' }}>{carregando ? <CircularProgress size={24} /> : (aba === 0 ? 'Entrar' : 'Cadastrar e Entrar')}</Button></Grid>
          {erro && (<Grid item xs={12} sx={{ mt: 2 }}><Typography color="error" align="center">{erro}</Typography></Grid>)}
        </Grid>
      </form>
    </>
  );
};

// --- Componente que gerencia a tela principal após o login ---
const GeradorProvas = ({ usuario, token, onLogout }) => {
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dadosForm, setDadosForm] = useState(null); //comeca com null, ai quando tem dados aqui passa pra prox tela de resultados

  //ativa o carregabndo, usa o axios e preenche os dados das questoes ou com erro
  const handleGerarQuestoes = async (dadosDoFormulario) => {
    setCarregando(true); setErro(''); setQuestoes([]);
    const urlApi = 'http://127.0.0.1:8000/gerar-prova';
    const payload = {
      tema: dadosDoFormulario.tema,
      serie: dadosDoFormulario.serie,
      quantidadeMultipla: parseInt(dadosDoFormulario.quantidadeMultipla, 10) || 0,
      quantidadeDissertativa: parseInt(dadosDoFormulario.quantidadeDissertativa, 10) || 0,
    };

    try {
      const response = await axios.post(urlApi, payload, { headers: { 'Authorization': `Bearer ${token}` } });

      // --- DEBUG: LOG A RESPOSTA PARA VER A ESTRUTURA REAL ---
      console.log("Resposta recebida da API:", JSON.stringify(response.data, null, 2));

      // A linha principal para extrair os dados.
      // Com o novo prompt, isso agora deve funcionar de forma consistente.
      const questoesRecebidas = response.data.questoes_geradas;

      if (Array.isArray(questoesRecebidas) && questoesRecebidas.length > 0) {
        // Verifica se os objetos dentro do array não estão vazios ou malformados
        if (questoesRecebidas[0] && questoesRecebidas[0].pergunta) {
          setQuestoes(questoesRecebidas);
          setDadosForm(dadosDoFormulario);
        } else {
          setErro("A IA retornou dados, mas em um formato de questão inválido. Verifique o prompt no back-end.");
        }
      } else {
        setErro("A IA não retornou questões no formato esperado ou o array está vazio.");
      }
    } catch (error) {
      console.error("Erro detalhado ao chamar a API:", error.response || error.message);
      setErro(error.response?.data?.detail || "Ocorreu um erro grave ao se comunicar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  //editar as questoes
  const handleUpdateQuestao = (index, questaoAtualizada) => {
    const novasQuestoes = [...questoes];
    novasQuestoes[index] = questaoAtualizada;
    setQuestoes(novasQuestoes);
  };

  const handleDeleteQuestao = (index) => {
    const novasQuestoes = questoes.filter((_, i) => i !== index);
    setQuestoes(novasQuestoes);
  };

  //desenha a pagina na tela
  return (
    <>
      <Box sx={{ textAlign: 'right', mb: 2, alignSelf: 'flex-end' }}>
        <Typography variant="body2" sx={{ display: 'inline-block', mr: 2 }}>Olá, {usuario.nome.split(' ')[0]}</Typography>
        <Button onClick={onLogout} size="small" variant="outlined">Sair</Button>
      </Box>
      {!dadosForm ? (
        <FormularioGerador
          onSubmit={handleGerarQuestoes}
          carregando={carregando}
          nomeProfessor={usuario.nome}
        />
      ) : (
        <ListaQuestoes
          questoes={questoes}
          nomeProfessor={usuario.nome}
          dadosFormulario={dadosForm}
          onReset={() => { setDadosForm(null); setQuestoes([]); }}
          onUpdateQuestao={handleUpdateQuestao}
          onDeleteQuestao={handleDeleteQuestao}
        />
      )}
      {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}
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
        const provasOrdenadas = response.data.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
        setProvas(provasOrdenadas);
      } catch (error) {
        setErro('Não foi possível carregar o histórico de provas.');
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
      const nomeArquivo = `${prova.titulo.replace(/\s+/g, '_')}.pdf`;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert('Não foi possível baixar a prova. Tente novamente.');
    } finally {
      setBaixandoId(null);
    }
  };

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (erro) {
    return <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onVoltar} sx={{ mb: 2 }}>
        Voltar para o Gerador
      </Button>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Meu Histórico de Provas
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {provas.length > 0 ? (
        <List>
          {provas.map((prova) => (
            <ListItem key={prova.id} divider>
              <ListItemAvatar>
                <Avatar>
                  <ArticleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={prova.titulo}
                secondary={`Criada em: ${new Date(prova.data_criacao).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}`}
              />
              <ListItemSecondaryAction>
                {baixandoId === prova.id ? (
                  <CircularProgress size={24} />
                ) : (
                  <IconButton edge="end" aria-label="download" onClick={() => handleDownload(prova)}>
                    <DownloadIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          Você ainda não gerou nenhuma prova.
        </Alert>
      )}
    </Box>
  );
};

// --- COMPONENTE MODIFICADO E CORRIGIDO: TelaPrincipal ---
const TelaPrincipal = ({ usuario, token, onLogout }) => {
  const [view, setView] = useState('generator'); // 'generator' ou 'history'
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dadosForm, setDadosForm] = useState(null);

  // --- LÓGICA DA API E DAS QUESTÕES RESTAURADA AQUI ---
  const handleGerarQuestoes = async (dadosDoFormulario) => {
    setCarregando(true);
    setErro('');
    setQuestoes([]);
    const urlApi = 'http://127.0.0.1:8000/gerar-prova';
    const payload = {
      tema: dadosDoFormulario.tema,
      serie: dadosDoFormulario.serie,
      quantidadeMultipla: parseInt(dadosDoFormulario.quantidadeMultipla, 10) || 0,
      quantidadeDissertativa: parseInt(dadosDoFormulario.quantidadeDissertativa, 10) || 0,
    };

    try {
      const response = await axios.post(urlApi, payload, { headers: { 'Authorization': `Bearer ${token}` } });
      const questoesRecebidas = response.data.questoes_geradas;

      if (Array.isArray(questoesRecebidas) && questoesRecebidas.length > 0) {
        if (questoesRecebidas[0] && questoesRecebidas[0].pergunta) {
          setQuestoes(questoesRecebidas);
          setDadosForm(dadosDoFormulario);
        } else {
          setErro("A IA retornou dados, mas em um formato de questão inválido. Verifique o prompt no back-end.");
        }
      } else {
        setErro("A IA não retornou questões no formato esperado ou o array está vazio.");
      }
    } catch (error) {
      console.error("Erro detalhado ao chamar a API:", error.response || error.message);
      setErro(error.response?.data?.detail || "Ocorreu um erro grave ao se comunicar com o servidor.");
    } finally {
      // Esta é a linha crucial que estava faltando, que para o carregamento
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

  const handleReset = () => {
    setDadosForm(null);
    setQuestoes([]);
  };
  // Se a view for 'history', renderiza a tela de histórico
  if (view === 'history') {
    return <TelaHistorico token={token} onVoltar={() => setView('generator')} />;
  }

  // Senão, renderiza a tela principal do gerador
  return (
    <>
      {/* Cabeçalho com o novo botão "Histórico" */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2">Olá, {usuario.nome.split(' ')[0]}</Typography>
        <Box>
          <Button onClick={() => setView('history')} variant="text" sx={{ mr: 1 }}>
            Histórico
          </Button>
          <Button onClick={onLogout} size="small" variant="outlined">Sair</Button>
        </Box>
      </Box>

      {/* Conteúdo do Gerador */}
      {!dadosForm ? (
        <FormularioGerador
          onSubmit={handleGerarQuestoes}
          carregando={carregando}
          nomeProfessor={usuario.nome}
        />
      ) : (
        <ListaQuestoes
          questoes={questoes}
          nomeProfessor={usuario.nome}
          dadosFormulario={dadosForm}
          onReset={handleReset}
          onUpdateQuestao={handleUpdateQuestao}
          onDeleteQuestao={handleDeleteQuestao}
        />
      )}

      {erro && <Typography color="error" align="center" sx={{ mt: 2 }}>{erro}</Typography>}
    </>
  );
};

// --- Componente Principal App.jsx ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    const fetchUsuario = async () => {
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/professores/me/', { headers: { 'Authorization': `Bearer ${token}` } });
          setUsuario(response.data);
        } catch (error) { handleLogout(); }
      } else { setUsuario(null); }
    };
    fetchUsuario();
  }, [token]);
  const handleLoginSuccess = (newToken) => { localStorage.setItem('token', newToken); setToken(newToken); };
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Grid container justifyContent="center">
            <Grid item xs={11} sm={10} md={8} lg={7} xl={6}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img src="/logo.png" alt="Logotipo do Projeto" style={{ width: '190px', height: 'auto', marginBottom: '16px' }} />
                <Typography variant="h4" component="h1" gutterBottom>Gerador de Provas</Typography>
                <Typography variant="subtitle1" color="text.secondary">Crie avaliações personalizadas com o poder da IA</Typography>
              </Box>
              <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%' }}>
                {token && !usuario ? (<Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>)
                  : !usuario ? (<TelaAutenticacao onLoginSuccess={handleLoginSuccess} />)
                    : (<TelaPrincipal usuario={usuario} token={token} onLogout={handleLogout} />)}
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
