import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, Stack, Divider, Button } from '@mui/material'; // Adicionei 'Button' ao import
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RenderizadorMarkdown from './RenderizadorMarkdown'; // Importamos para a visão de exibição

export default function QuestaoEditavel({ questao, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestao, setEditedQuestao] = useState(questao);

  const handleSave = () => {
    onUpdate(editedQuestao);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestao(questao);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "alternativas") {
        setEditedQuestao({ ...editedQuestao, [name]: value.split('\n') });
    } else {
        setEditedQuestao({ ...editedQuestao, [name]: value });
    }
  };

  // --- Visão de Edição (Agora é à prova de falhas) ---
  if (isEditing) {
    return (
      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'action.hover' }}>
        <TextField
          label={`Pergunta ${index + 1}`}
          name="pergunta"
          // ATUALIZADO: Adicionamos `|| ''` como um valor padrão seguro
          value={editedQuestao.pergunta || ''}
          onChange={handleChange}
          multiline
          fullWidth
          variant="filled"
          margin="normal"
        />
        {editedQuestao.tipo === 'multipla_escolha' ? (
          <>
            <TextField 
              label="Alternativas (uma por linha)" 
              name="alternativas" 
              // ATUALIZADO: (editedQuestao.alternativas || []) garante que .join() nunca falhe
              value={(editedQuestao.alternativas || []).join('\n')} 
              onChange={handleChange} 
              multiline 
              fullWidth 
              variant="filled"
              margin="normal" 
            />
            <TextField 
              label="Resposta Correta (ex: A)" 
              name="resposta_correta" 
              value={editedQuestao.resposta_correta || ''} 
              onChange={handleChange} 
              fullWidth 
              variant="filled"
              margin="normal" 
            />
          </>
        ) : (
          <TextField 
            label="Resposta Esperada (Gabarito)" 
            name="resposta_esperada" 
            value={editedQuestao.resposta_esperada || ''} 
            onChange={handleChange} 
            multiline 
            fullWidth 
            variant="filled"
            margin="normal" 
          />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button startIcon={<CloseIcon />} onClick={handleCancel} color="inherit">Cancelar</Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={handleSave}>Salvar</Button>
        </Stack>
      </Box>
    );
  }

  // --- Visão de Exibição (Padrão) ---
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        {/* Usando o RenderizadorMarkdown para exibir a pergunta formatada */}
        <RenderizadorMarkdown 
          text={`**Questão ${index + 1}:** ${questao.pergunta}`}
          sx={{ flexGrow: 1, pr: 1, textAlign: 'left' }}
        />
        <Box>
          <IconButton aria-label="Editar" size="small" onClick={() => setIsEditing(true)}><EditIcon fontSize="small" /></IconButton>
          <IconButton aria-label="Excluir" size="small" onClick={() => onDelete()}><DeleteIcon color="error" fontSize="small" /></IconButton>
        </Box>
      </Stack>
      {questao.tipo === 'multipla_escolha' && (
        <Box sx={{ mt: 1, pl: 2, textAlign: 'left' }}>
            {(questao.alternativas || []).map((alt, i) => <Typography key={i} variant="body2">{alt}</Typography>)}
        </Box>
      )}
    </Box>
  );
}