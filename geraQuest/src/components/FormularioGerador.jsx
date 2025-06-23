import React, { useState } from 'react';
// Removidos Divider e Chip, pois não são mais necessários
import { TextField, Button, Box, Typography, CircularProgress, Grid, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export default function FormularioGerador({ onSubmit, carregando }) {
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [tema, setTema] = useState('');
  const [serie, setSerie] = useState('');
  const [tiposSelecionados, setTiposSelecionados] = useState({ multipla_escolha: true, dissertativa: false });
  const [qtdMultipla, setQtdMultipla] = useState(5);
  const [qtdDissertativa, setQtdDissertativa] = useState(3);

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
    onSubmit(dadosParaApi);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* --- Bloco 1: Informações da Prova --- */}
      <Typography variant="h6" component="h3" gutterBottom>
        Informações da Prova
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField margin="dense" label="Nome do Professor(a)" value={nomeProfessor} onChange={(e) => setNomeProfessor(e.target.value)} required fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField margin="dense" label="Tema da Aula" value={tema} onChange={(e) => setTema(e.target.value)} required fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField margin="dense" label="Ano/Série" value={serie} onChange={(e) => setSerie(e.target.value)} required fullWidth />
        </Grid>
      </Grid>

      {/* --- Bloco 2: Estrutura da Prova --- */}
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>
        Estrutura da Prova
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <FormGroup row>
            <FormControlLabel 
              control={<Checkbox checked={tiposSelecionados.multipla_escolha} onChange={handleTipoChange} name="multipla_escolha" />} 
              label="Múltipla Escolha" 
            />
            <FormControlLabel 
              control={<Checkbox checked={tiposSelecionados.dissertativa} onChange={handleTipoChange} name="dissertativa" />} 
              label="Dissertativa" 
            />
          </FormGroup>
        </Grid>

        {tiposSelecionados.multipla_escolha && (
          <Grid item xs={12} sm={6}>
            <TextField margin="dense" label="Qtd. Múltipla Escolha" type="number" value={qtdMultipla} onChange={(e) => setQtdMultipla(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth />
          </Grid>
        )}
        {tiposSelecionados.dissertativa && (
          <Grid item xs={12} sm={6}>
            <TextField margin="dense" label="Qtd. Dissertativas" type="number" value={qtdDissertativa} onChange={(e) => setQtdDissertativa(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth />
          </Grid>
        )}
      </Grid>
      
      {/* Botão de Ação no final de tudo */}
      <Box sx={{ mt: 4 }}>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={carregando || (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa)} 
          fullWidth 
          startIcon={<AutoFixHighIcon />}
          sx={{ height: '56px', fontSize: '1rem' }}
        >
          {carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Prova com IA'}
        </Button>
      </Box>
    </Box>
  );
}