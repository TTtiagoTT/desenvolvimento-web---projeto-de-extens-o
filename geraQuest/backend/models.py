from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

# Importa a Base do nosso arquivo central database.py
from database import Base

# Tabela para armazenar os dados dos professores
class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    # IMPORTANTE: Nunca guarde a senha em texto. Guarde apenas o hash.
    senha_hash = Column(String, nullable=False)

    # Relação: Um professor pode ter várias provas
    provas = relationship("Prova", back_populates="dono")

# Tabela para armazenar o histórico de provas geradas
class Prova(Base):
    __tablename__ = "provas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    # Armazena o "endereço" do arquivo PDF no servidor
    caminho_arquivo = Column(String, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    
    # Chave estrangeira para ligar a prova ao professor
    professor_id = Column(Integer, ForeignKey("professores.id"))
    
    # Relação inversa: Uma prova pertence a um dono (Professor)
    dono = relationship("Professor", back_populates="provas")
