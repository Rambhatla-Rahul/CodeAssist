import os
from dotenv import load_dotenv
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_ollama import ChatOllama
load_dotenv()


NVIDIA_AI_API_KEY = f"{os.getenv("NVIDIA_AI_API_KEY")}"


nvidia_model = ChatNVIDIA(
    model="nvidia/nemotron-3-super-120b-a12b",
    api_key=NVIDIA_AI_API_KEY,
    temperature=1,
    top_p=0.95,
)

reasoning_model = ChatOllama(
    model="gemma4:31b-cloud",
    temperature=0.1,
    reasoning=True,
)

coding_model = ChatOllama(
    model="qwen3-coder:480b-cloud",
    temperature=0.1,
    reasoning=True,
)





if __name__ == "__main__":
    # for chunk in reasoning_model.stream("Explain how a computer works in three sentences."):
    #     print(chunk.content)
    pass