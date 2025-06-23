import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except AttributeError:
    print("Erro: A chave de API do Gemini não foi encontrada.")
    exit()

# --- Modelos de Dados Pydantic ATUALIZADO ---
class QuestaoRequest(BaseModel):
    nomeProfessor: str
    tema: str
    serie: str
    # Novos campos de quantidade, com validação para não serem negativos
    quantidadeMultipla: int = Field(..., ge=0)
    quantidadeDissertativa: int = Field(..., ge=0)

app = FastAPI()
# ... (código do CORS continua o mesmo)
origins = ["http://localhost:5173", "http://localhost:5174"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- Função para criar o prompt ATUALIZADA ---
def criar_prompt(tema: str, serie: str, qtd_multipla: int, qtd_dissertativa: int) -> str:
    # Constrói a descrição da tarefa dinamicamente
    partes_tarefa = []
    if qtd_multipla > 0:
        partes_tarefa.append(f"{qtd_multipla} questões de múltipla escolha (com 4 alternativas de A a D)")
    if qtd_dissertativa > 0:
        partes_tarefa.append(f"{qtd_dissertativa} questões dissertativas")
    
    descricao_tarefa = " e ".join(partes_tarefa)

    return f"""
    Você é um assistente especialista em criar avaliações educacionais.
    Sua tarefa é gerar uma prova sobre o tema "{tema}" para a série "{serie}", contendo {descricao_tarefa}.

    Sua resposta DEVE ser um único objeto JSON válido, contendo uma chave "questoes", que é uma lista de objetos.
    Não inclua texto ou formatação fora do JSON.

    Para questões de múltipla escolha, cada objeto na lista deve ter as chaves: "pergunta", "tipo" (com valor "multipla_escolha"), "alternativas" (lista de 4 strings), e "resposta_correta" (a letra da alternativa correta).

    Para questões dissertativas, cada objeto na lista deve ter as chaves: "pergunta", "tipo" (com valor "dissertativa"), e "resposta_esperada" (o gabarito detalhado para o professor).

    Gere o conteúdo agora, misturando os tipos de questão na prova se ambos forem solicitados.
    """

@app.get("/")
def read_root():
    return {"message": "Servidor do Gerador de Provas está funcionando."}

@app.post("/gerar-questoes")
async def gerar_questoes_endpoint(request: QuestaoRequest):
    if request.quantidadeMultipla == 0 and request.quantidadeDissertativa == 0:
        raise HTTPException(status_code=400, detail="Pelo menos um tipo de questão deve ter quantidade maior que zero.")
        
    try:
        prompt = criar_prompt(
            request.tema, 
            request.serie, 
            request.quantidadeMultipla, 
            request.quantidadeDissertativa
        )
        
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        try:
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            data = json.loads(cleaned_response_text)
            
            if "questoes" not in data or not isinstance(data["questoes"], list):
                 raise HTTPException(status_code=500, detail="A resposta da IA não é válida.")

            return data

        except (json.JSONDecodeError, AttributeError):
            raise HTTPException(status_code=500, detail=f"A resposta da IA não é um JSON válido: {response.text}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado: {str(e)}")