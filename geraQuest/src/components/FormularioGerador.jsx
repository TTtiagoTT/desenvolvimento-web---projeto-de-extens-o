import React, { useState } from 'react';
// NOVO: Importamos o Grid
import { TextField, Button, Box, Typography, CircularProgress, Grid } from '@mui/material';

export default function FormularioGerador({ onSubmit, carregando }) {
  const [nomeProfessor, setNomeProfessor] = useState('');
  const [tema, setTema] = useState('');
  const [serie, setSerie] = useState('');
  const [quantidade, setQuantidade] = useState(5);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ nomeProfessor, tema, serie, quantidade });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mb: 4 }} // Apenas margem inferior aqui
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Gerador de Atividades com IA
      </Typography>

      {/* NOVO: Usamos Grid para o layout dos campos */}
      <Grid container spacing={2}> {/* spacing={2} adiciona um espaço entre os itens */}
        <Grid item xs={12}> {/* xs={12} significa: em telas extra-pequenas (todas), ocupe 12/12 colunas (largura total) */}
          <TextField
            label="Nome do Professor"
            variant="outlined"
            value={nomeProfessor}
            onChange={(e) => setNomeProfessor(e.target.value)}
            required
            fullWidth // Faz o campo ocupar toda a largura do Grid item
          />
        </Grid>

        {/* Estes dois campos ficarão lado a lado em telas médias ou maiores */}
        <Grid item xs={12} md={8}> {/* Ocupa 100% no celular (xs) e ~66% no desktop (md) */}
           <TextField
            label="Tema da Aula"
            variant="outlined"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}> {/* Ocupa 100% no celular (xs) e ~33% no desktop (md) */}
          <TextField
            label="Quantidade"
            type="number"
            variant="outlined"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value))}
            InputProps={{ inputProps: { min: 1, max: 20 } }}
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Ano/Série (ex: 9º Ano do Ensino Fundamental)"
            variant="outlined"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            required
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            disabled={carregando}
            fullWidth // O botão também ocupará a largura total
            sx={{ height: '56px', fontSize: '1rem' }} // Estilo para manter a altura e um bom tamanho de fonte
          >
            {carregando ? <CircularProgress size={24} color="inherit" /> : 'Gerar Questões'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}