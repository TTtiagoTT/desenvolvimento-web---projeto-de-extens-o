from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Define o arquivo do banco de dados SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./geraquest.db"

# Cria a conexão com o banco
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria uma classe que gerencia as sessões (conversas) com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Uma classe base para nossos modelos de tabela
Base = declarative_base()

# Função de dependência que será usada em todos os endpoints
# para obter uma sessão com o banco e fechá-la ao final.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
