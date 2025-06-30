//formulario do professor para mandar os dados para o App.jsx
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Grid, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; //icone de varinha

export default function FormularioGerador({ onSubmit, carregando }) {
  //memoria ou estados
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [tema, setTema] = useState('');
  const [serie, setSerie] = useState('');
  const [tiposSelecionados, setTiposSelecionados] = useState({ multipla_escolha: true, dissertativa: false });
  const [qtdMultipla, setQtdMultipla] = useState(5);
  const [qtdDissertativa, setQtdDissertativa] = useState(3);

  //cuida dos checkbox
  const handleTipoChange = (event) => {
    setTiposSelecionados({ ...tiposSelecionados, [event.target.name]: event.target.checked });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa) {
      alert("Por favor, selecione pelo menos um tipo de questão.");
      return;
    }
    const dadosParaApi = {
      nomeProfessor, tema, serie,
      quantidadeMultipla: tiposSelecionados.multipla_escolha ? Number(qtdMultipla) : 0,
      quantidadeDissertativa: tiposSelecionados.dissertativa ? Number(qtdDissertativa) : 0,
    };
    //envia os dados para o App.jsx
    onSubmit(dadosParaApi);
  };

  return (
    //desenha o formulario na tela
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" component="h3" gutterBottom>Informações da Prova</Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}><TextField margin="dense" label="Nome do Professor(a)" value={nomeProfessor} onChange={(e) => setNomeProfessor(e.target.value)} required fullWidth /></Grid>
        <Grid xs={12} md={6}><TextField margin="dense" label="Tema da Aula" value={tema} onChange={(e) => setTema(e.target.value)} required fullWidth /></Grid>
        <Grid xs={12}><TextField margin="dense" label="Ano/Série" value={serie} onChange={(e) => setSerie(e.target.value)} required fullWidth /></Grid>
      </Grid>

      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Estrutura da Prova</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid xs={12}>
          <FormGroup row>
            <FormControlLabel control={<Checkbox checked={tiposSelecionados.multipla_escolha} onChange={handleTipoChange} name="multipla_escolha" />} label="Múltipla Escolha" />
            <FormControlLabel control={<Checkbox checked={tiposSelecionados.dissertativa} onChange={handleTipoChange} name="dissertativa" />} label="Dissertativa" />
          </FormGroup>
        </Grid>
        {tiposSelecionados.multipla_escolha && (
          <Grid xs={12} sm={6}><TextField margin="dense" label="Qtd. Múltipla Escolha" type="number" value={qtdMultipla} onChange={(e) => setQtdMultipla(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth /></Grid>
        )}
        {tiposSelecionados.dissertativa && (
          <Grid xs={12} sm={6}><TextField margin="dense" label="Qtd. Dissertativas" type="number" value={qtdDissertativa} onChange={(e) => setQtdDissertativa(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth /></Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Button type="submit" variant="contained" disabled={carregando || (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa)} fullWidth startIcon={<AutoFixHighIcon />} sx={{ height: '56px', fontSize: '1rem' }}>
          {carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Prova com IA'}
        </Button>
      </Box>
    </Box>
  );
}