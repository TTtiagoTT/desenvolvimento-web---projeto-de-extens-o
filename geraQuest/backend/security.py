from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Imports corrigidos para serem diretos e não relativos
import models
import schemas
# Importa a função de dependência do banco de dados
from database import get_db

# --- CONFIGURAÇÃO DE SEGURANÇA ---
SECRET_KEY = "SUA_CHAVE_SECRETA_MUITO_FORTE"  # Mude isso!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema de autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- FUNÇÕES DE UTILIDADE ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- FUNÇÕES DE BANCO DE DADOS (USUÁRIO) ---
def get_user(db: Session, email: str):
    return db.query(models.Professor).filter(models.Professor.email == email).first()

def create_user(db: Session, user: schemas.ProfessorCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.Professor(email=user.email, nome=user.nome, senha_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.senha_hash):
        return False
    return user

# --- DEPENDÊNCIA PARA OBTER USUÁRIO LOGADO ---
# CORRIGIDO: Adicionada a dependência do banco de dados (db: Session)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.Professor = Depends(get_current_user)):
    # Futuramente, você pode adicionar uma verificação se o usuário está ativo
    # if current_user.disabled:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
