import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Configura a API do Gemini com a chave
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except AttributeError as e:
    print("Erro: A chave de API do Gemini não foi encontrada. Verifique seu arquivo .env")
    exit()

# --- Modelos de Dados Pydantic ---
class QuestaoRequest(BaseModel):
    nomeProfessor: str
    tema: str
    serie: str
    quantidade: int

# --- Instância e CORS do FastAPI ---
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Função para criar o prompt ---
def criar_prompt(tema: str, serie: str, quantidade: int) -> str:
    return f"""
    Você é um assistente especialista em criar avaliações educacionais para professores.
    Sua tarefa é gerar uma prova e um gabarito com base nos seguintes parâmetros:
    - Tema: {tema}
    - Série/Ano: {serie}
    - Quantidade de Questões: {quantidade}

    As questões devem ser de múltipla escolha, com 4 alternativas cada (A, B, C, D).
    Uma das alternativas deve ser a correta.

    Sua resposta DEVE ser um único objeto JSON válido, sem nenhum texto ou formatação adicional antes ou depois.
    O JSON deve ter duas chaves principais: "prova_aluno" e "prova_professor".

    O valor de "prova_aluno" deve ser uma string única contendo todas as questões e alternativas, formatadas para o aluno. Use '\\n' para novas linhas.
    Exemplo para 'prova_aluno':
    "Questão 1: [Enunciado da questão 1]\\n\\nA) Alternativa A\\nB) Alternativa B\\nC) Alternativa C\\nD) Alternativa D\\n\\nQuestão 2: [Enunciado da questão 2]..."

    O valor de "prova_professor" deve ser uma string única contendo as mesmas questões, alternativas E a resposta correta de forma clara. Use '\\n' para novas linhas.
    Exemplo para 'prova_professor':
    "Questão 1: [Enunciado da questão 1]\\n\\nA) Alternativa A\\nB) Alternativa B\\nC) Alternativa C\\nD) Alternativa D\\nResposta Correta: [Letra e texto da alternativa correta]\\n\\nQuestão 2: [Enunciado da questão 2]..."

    Gere o conteúdo agora.
    """

# --- Endpoints da API ---
@app.get("/")
def read_root():
    return {"message": "Servidor do Gerador de Provas está funcionando."}


@app.post("/gerar-questoes")
async def gerar_questoes_endpoint(request: QuestaoRequest):
    """
    Recebe os dados do formulário, gera um prompt, chama a API do Gemini
    e retorna a prova formatada.
    """
    try:
        prompt = criar_prompt(request.tema, request.serie, request.quantidade)
        
        # Configuração do modelo Gemini
        generation_config = {
          "temperature": 0.7,
          "top_p": 1,
          "top_k": 1,
          "max_output_tokens": 8192,
        }
        model = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config=generation_config)
        
        # Chama a API
        response = model.generate_content(prompt)
        
        # Tenta processar a resposta como JSON
        try:
            # A resposta da API vem em response.text
            # Limpa a resposta para garantir que seja um JSON válido
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            data = json.loads(cleaned_response_text)
            
            # Valida se as chaves esperadas existem
            if "prova_aluno" not in data or "prova_professor" not in data:
                raise HTTPException(status_code=500, detail="A resposta da IA não contém as chaves esperadas.")
            
            return data

        except (json.JSONDecodeError, AttributeError):
            # Se a IA não retornar um JSON válido, retorna o texto bruto como erro
            raise HTTPException(status_code=500, detail=f"A resposta da IA não é um JSON válido: {response.text}")

    except Exception as e:
        # Captura qualquer outro erro que possa acontecer
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado: {str(e)}")