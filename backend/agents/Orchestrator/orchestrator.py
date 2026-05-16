import json

from models.models import reasoning_model
from graph.state import GraphState
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from agents.Coder.coder import coder_agent



def orchestrator(state:GraphState) -> GraphState:
    pass



def find_task_by_id(tasks_data: dict, target_id: str) -> dict | None:
    return next(
        (task for task in tasks_data["implementation_tasks"] if task.get("task_id") == target_id), 
        None
    )

def task_to_coder_agent(state: GraphState) -> GraphState:
    tasks = state["tasks"]
    order = tasks['execution_order']
    for task_id in order:
        task = find_task_by_id(tasks,task_id)
        if task['assigned_agent_type'] == "coder":
            coder_agent(state,task)
        else:
            print("Not Coder")
    return state

