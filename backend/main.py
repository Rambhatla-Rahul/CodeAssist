from fastapi import FastAPI
from agents.Parser.parser_agent import intent_parser,project_namer
from agents.Research.research_agent import research_agent
from agents.Architecture.architecture_agent import architecture_agent
from agents.ProjectStructure.project_structure import project_structure_agent
from agents.Decomposer.decomposer import task_decomposer
from agents.Orchestrator.orchestrator import task_to_coder_agent
from graph.state import get_initial_state
import uvicorn as uv

# app = FastAPI()



if __name__ == "__main__":
    initial_state = get_initial_state()

    user_intent = "I would like to build a website with cool frontend and MongoDB for backend. Frontend should be build on react NextJs Folder router system. Use animated components and tailwindcss to design great ui and a authentication modal with Acutal backend auth system using express node. Tech Stack should only have ReactJS (no typescript) ExpressJS NodeJS MongoDB. Focus more on frontend creativity and Backend Auth layer."
    updated_state = intent_parser(raw_intent=user_intent,state=initial_state)
    updated_state = project_namer(updated_state)
    updated_state = research_agent(updated_state)
    updated_state = architecture_agent(updated_state)
    updated_state = project_structure_agent(updated_state)
    updated_state = task_decomposer(updated_state)
    updated_state = task_to_coder_agent(updated_state)
    print(updated_state["code_file"])