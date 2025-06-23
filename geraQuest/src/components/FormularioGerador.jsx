import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Grid, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

export default function FormularioGerador({ onSubmit, carregando }) {
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [tema, setTema] = useState('');
  const [serie, setSerie] = useState('');
  
  const [tiposSelecionados, setTiposSelecionados] = useState({
    multipla_escolha: true,
    dissertativa: false,
  });

  const [qtdMultipla, setQtdMultipla] = useState(5);
  const [qtdDissertativa, setQtdDissertativa] = useState(3);

  const handleTipoChange = (event) => {
    setTiposSelecionados({
      ...tiposSelecionados,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa) {
        alert("Por favor, selecione pelo menos um tipo de questão.");
        return;
    }

    const dadosParaApi = {
        nomeProfessor,
        tema,
        serie,
        // CORRIGIDO: O erro de digitação "multipla_colha" foi ajustado para "multipla_escolha"
        quantidadeMultipla: tiposSelecionados.multipla_escolha ? Number(qtdMultipla) : 0,
        quantidadeDissertativa: tiposSelecionados.dissertativa ? Number(qtdDissertativa) : 0,
    };
    onSubmit(dadosParaApi);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2">
        Gerador de Atividades com IA
      </Typography>
      <Grid container spacing={3}> {/* Aumentei um pouco o spacing para 3 */}
        {/* --- ETAPA 1: Informações Básicas --- */}
        <Grid item xs={12} md={6}><TextField label="Nome do Professor" value={nomeProfessor} onChange={(e) => setNomeProfessor(e.target.value)} required fullWidth /></Grid>
        <Grid item xs={12} md={6}><TextField label="Tema da Aula" value={tema} onChange={(e) => setTema(e.target.value)} required fullWidth /></Grid>
        <Grid item xs={12}><TextField label="Ano/Série" value={serie} onChange={(e) => setSerie(e.target.value)} required fullWidth /></Grid>

        {/* --- ETAPA 2: Seleção de Tipos --- */}
        <Grid item xs={12}>
            <Typography variant="subtitle1">Selecione os Tipos de Questão:</Typography>
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

        {/* --- ETAPA 3: Campos de Quantidade Condicionais --- */}
        {tiposSelecionados.multipla_escolha && (
            <Grid item xs={12} sm={6}>
                <TextField label="Qtd. Múltipla Escolha" type="number" value={qtdMultipla} onChange={(e) => setQtdMultipla(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth />
            </Grid>
        )}
        {tiposSelecionados.dissertativa && (
            <Grid item xs={12} sm={6}>
                <TextField label="Qtd. Dissertativas" type="number" value={qtdDissertativa} onChange={(e) => setQtdDissertativa(e.target.value)} InputProps={{ inputProps: { min: 1, max: 20 } }} required fullWidth />
            </Grid>
        )}

        {/* --- ETAPA 4: BOTÃO DE AÇÃO (FINAL DO FORMULÁRIO) --- */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando || (!tiposSelecionados.multipla_escolha && !tiposSelecionados.dissertativa)} fullWidth sx={{ height: '56px', fontSize: '1rem' }}>
            {carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Questões'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}