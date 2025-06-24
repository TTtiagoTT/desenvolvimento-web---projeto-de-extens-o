import os
import json
#fatsapi para o servidor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
#pydantic para validacao de dados
from pydantic import BaseModel, Field
import google.generativeai as genai
#carregar variaveis de ambiente env
from dotenv import load_dotenv

#tenta usar a api key do gemini
load_dotenv()
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except AttributeError:
    print("Erro: A chave de API do Gemini não foi encontrada.")
    exit()

#molde de dados para a requisicaoo
class QuestaoRequest(BaseModel):
    nomeProfessor: str
    tema: str
    serie: str
    quantidadeMultipla: int = Field(..., ge=0)
    quantidadeDissertativa: int = Field(..., ge=0)

app = FastAPI()
origins = ["http://localhost:5173", "http://localhost:5174"]
#como a api tem um endereco diferente do front usamos o cors para permitir acesso
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def criar_prompt(tema: str, serie: str, qtd_multipla: int, qtd_dissertativa: int) -> str:
    prompt_base = f"""
    Você é um assistente especialista em criar avaliações educacionais para professores.
    Sua tarefa é gerar uma prova sobre o tema "{tema}" para a série "{serie}".
    Sua resposta DEVE ser um único objeto JSON válido, contendo uma chave "questoes", que é uma lista de objetos. Não inclua NENHUM texto, formatação ou markdown fora do objeto JSON.
    """

    # Cenário 1: Apenas Múltipla Escolha
    if qtd_multipla > 0 and qtd_dissertativa == 0:
        instrucao_especifica = f"""
        Gere EXATAMENTE {qtd_multipla} questões.
        É CRUCIAL que TODAS as questões sejam do tipo 'multipla_escolha'. NÃO inclua NENHUMA questão dissertativa.
        Cada objeto na lista deve ter as chaves: "pergunta" (string), "tipo" (com o valor fixo "multipla_escolha"), "alternativas" (uma lista de 4 strings, ex: ["A) ...", "B) ..."]), e "resposta_correta" (a letra da alternativa correta, ex: "C").
        """
    # Cenário 2: Apenas Dissertativa
    elif qtd_dissertativa > 0 and qtd_multipla == 0:
        instrucao_especifica = f"""
        Gere EXATAMENTE {qtd_dissertativa} questões.
        É CRUCIAL que TODAS as questões sejam do tipo 'dissertativa'. NÃO inclua NENHUMA questão de múltipla escolha.
        Cada objeto na lista deve ter as chaves: "pergunta" (string), "tipo" (com o valor fixo "dissertativa"), e "resposta_esperada" (o gabarito detalhado para o professor).
        """
    # Cenário 3: Prova Mista
    else:
        instrucao_especifica = f"""
        Gere uma prova mista contendo EXATAMENTE {qtd_multipla} questões de múltipla escolha E {qtd_dissertativa} questões dissertativas.
        Para questões de múltipla escolha, o objeto deve ter as chaves: "pergunta", "tipo" (com valor "multipla_escolha"), "alternativas" (lista de 4 strings), e "resposta_correta" (a letra da alternativa correta).
        Para questões dissertativas, o objeto deve ter as chaves: "pergunta", "tipo" (com valor "dissertativa"), e "resposta_esperada" (o gabarito detalhado).
        """
    
    return prompt_base + instrucao_especifica + "\nGere o conteúdo JSON agora."

#endpoints
#ver se o servidor esta rodando
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