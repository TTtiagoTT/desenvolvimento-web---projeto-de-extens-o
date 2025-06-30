import os
import json
from datetime import timedelta

# fastapi para o servidor e suas dependências de segurança
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
# sqlalchemy para o banco de dados
from sqlalchemy.orm import Session
# fpdf para gerar o PDF
from fpdf import FPDF
# carregar variaveis de ambiente .env
from dotenv import load_dotenv
# gemini para a IA
import google.generativeai as genai

# importa os módulos que criamos
import models
import schemas
import security
from database import engine, get_db

# --- CONFIGURAÇÃO INICIAL ---

# Cria as tabelas do banco de dados usando o "motor" do database.py
models.Base.metadata.create_all(bind=engine)
load_dotenv()

# tenta usar a api key do gemini
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except AttributeError:
    print("Erro: A chave de API do Gemini não foi encontrada.")
    exit()

app = FastAPI()

# como a api tem um endereco diferente do front usamos o cors para permitir acesso
origins = ["*"] 
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Em main.py

# --- FUNÇÃO PARA CRIAR O PROMPT ---
def criar_prompt(tema: str, serie: str, qtd_multipla: int, qtd_dissertativa: int) -> str:
    """
    Cria um prompt detalhado para a IA, especificando o formato exato da resposta JSON.
    """
    instrucoes_questoes = []
    if qtd_multipla > 0:
        instrucoes_questoes.append(
            f'- {qtd_multipla} questões de múltipla escolha. Cada questão deve ter um campo "pergunta", um campo "tipo" com o valor "multipla_escolha", um campo "alternativas" que é um array de 4 strings (ex: ["A) ...", "B) ...", "C) ...", "D) ..."]), e um campo "resposta_correta" com a letra da alternativa correta (ex: "A").'
        )
    if qtd_dissertativa > 0:
        instrucoes_questoes.append(
            f'- {qtd_dissertativa} questões dissertativas. Cada questão deve ter um campo "pergunta", um campo "tipo" com o valor "dissertativa", e um campo "resposta_esperada" contendo a resposta completa para o gabarito do professor.'
        )

    instrucao_geral = "\n".join(instrucoes_questoes)

    prompt_completo = f"""
    Você é um assistente especialista em criar avaliações educacionais para professores.
    Sua tarefa é gerar uma prova sobre o tema "{tema}" para a série/ano "{serie}".

    A prova deve conter EXATAMENTE:
    {instrucao_geral}

    Sua resposta DEVE SER OBRIGATORIAMENTE um único objeto JSON válido.
    O objeto JSON deve ter uma única chave principal chamada "questoes".
    O valor da chave "questoes" deve ser um array contendo todos os objetos de questão que você gerar.
    Não inclua sua resposta dentro de blocos de código markdown como ```json ou ```. Gere apenas o texto JSON puro.

    Exemplo da estrutura de um objeto de questão de múltipla escolha:
    {{
      "pergunta": "Qual a capital do Brasil?",
      "tipo": "multipla_escolha",
      "alternativas": ["A) São Paulo", "B) Rio de Janeiro", "C) Brasília", "D) Salvador"],
      "resposta_correta": "C"
    }}

    Exemplo da estrutura de um objeto de questão dissertativa:
    {{
      "pergunta": "Discorra sobre a importância da Revolução Francesa.",
      "tipo": "dissertativa",
      "resposta_esperada": "A Revolução Francesa foi um marco na história ocidental por disseminar ideais de liberdade, igualdade e fraternidade, além de derrubar o absolutismo e influenciar movimentos de independência em todo o mundo."
    }}

    Agora, gere a prova completa no formato JSON solicitado.
    """
    return prompt_completo

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Servidor do Gerador de Provas está funcionando."}

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    professor = security.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": professor.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/professores/", response_model=schemas.Professor)
def create_professor(professor: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    db_professor = security.get_user(db, email=professor.email)
    if db_professor:
        raise HTTPException(status_code=400, detail="E-mail já registrado")
    return security.create_user(db=db, user=professor)

@app.get("/professores/me/", response_model=schemas.Professor)
async def read_users_me(current_user: models.Professor = Depends(security.get_current_active_user)):
    return current_user

@app.get("/professores/me/provas", response_model=list[schemas.Prova])
async def read_own_provas(current_user: models.Professor = Depends(security.get_current_active_user)):
    return current_user.provas

@app.post("/gerar-prova")
async def gerar_prova_endpoint(
    request: schemas.ProvaRequest,
    db: Session = Depends(get_db),
    current_user: models.Professor = Depends(security.get_current_active_user)
):
    try:
        prompt = criar_prompt(request.tema, request.serie, request.quantidadeMultipla, request.quantidadeDissertativa)
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompt)
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(cleaned_response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar conteúdo com a IA: {str(e)}")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, f"Prova de {request.tema} - {request.serie}", ln=True, align='C')
    pdf.ln(10)
    
    # Adicionar lógica para popular o PDF com as questões...

    professor_id = current_user.id
    caminho_diretorio = f"provas_salvas/professor_{professor_id}"
    os.makedirs(caminho_diretorio, exist_ok=True)
    
    nome_arquivo = f"prova_{request.tema.replace(' ', '_')}_{len(os.listdir(caminho_diretorio)) + 1}.pdf"
    caminho_completo_arquivo = os.path.join(caminho_diretorio, nome_arquivo)
    
    pdf.output(caminho_completo_arquivo)
    
    nova_prova = models.Prova(
        titulo=f"Prova de {request.tema}",
        caminho_arquivo=caminho_completo_arquivo,
        professor_id=professor_id
    )
    db.add(nova_prova)
    db.commit()

    return {
        "message": "Prova gerada e salva com sucesso!",
        "caminho_do_pdf": caminho_completo_arquivo,
        "questoes_geradas": data.get("questoes", [])
    }

@app.get("/provas/{prova_id}/download")
async def download_prova(
    prova_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.Professor = Depends(security.get_current_active_user)
):
    """
    Endpoint para baixar um arquivo de prova em PDF.
    Verifica se a prova pertence ao usuário logado antes de servir o arquivo.
    """
    # Busca a prova no banco de dados pelo ID fornecido
    db_prova = db.query(models.Prova).filter(models.Prova.id == prova_id).first()

    # Verifica se a prova existe
    if not db_prova:
        raise HTTPException(status_code=404, detail="Prova não encontrada")

    # VERIFICAÇÃO DE SEGURANÇA: Garante que o professor só pode baixar suas próprias provas
    if db_prova.professor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado. Você não tem permissão para baixar esta prova.")
    
    # Pega o caminho do arquivo salvo no banco
    caminho_arquivo = db_prova.caminho_arquivo

    # Verifica se o arquivo realmente existe no servidor
    if not os.path.exists(caminho_arquivo):
        raise HTTPException(status_code=404, detail="Arquivo da prova não encontrado no servidor.")

    # Extrai o nome do arquivo do caminho completo para o cabeçalho do download
    nome_arquivo = os.path.basename(caminho_arquivo)

    # Usa FileResponse para enviar o arquivo ao usuário
    return FileResponse(
        path=caminho_arquivo, 
        filename=nome_arquivo, 
        media_type='application/pdf'
    )

#no back:
#python -m venv venv
#.\venv\Scripts\activate
#uvicorn main:app --reload

#front: npm run dev