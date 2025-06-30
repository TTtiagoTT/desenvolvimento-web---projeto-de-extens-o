from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Schemas para Provas ---

class ProvaBase(BaseModel):
    titulo: str
    caminho_arquivo: str

class Prova(ProvaBase):
    id: int
    data_criacao: datetime

    class Config:
        from_attributes = True # Permite que o Pydantic leia dados de objetos do banco

# --- Schemas para Professores ---

class ProfessorBase(BaseModel):
    email: str
    nome: str

class ProfessorCreate(ProfessorBase):
    password: str # Recebe a senha em texto plano para o cadastro

# Schema para exibir o professor e seu histórico de provas
class Professor(ProfessorBase):
    id: int
    provas: List[Prova] = []

    class Config:
        from_attributes = True

# --- Schemas para Autenticação ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Schema para a requisição de geração de prova ---
# Não precisa mais do professor_id, pois ele virá do token de login
class ProvaRequest(BaseModel):
    tema: str
    serie: str
    quantidadeMultipla: int = Field(..., ge=0)
    quantidadeDissertativa: int = Field(..., ge=0)
