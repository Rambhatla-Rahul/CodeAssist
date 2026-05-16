import json

from models.models import reasoning_model
from graph.state import GraphState
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils.output_schemas import task_decompose_schema
from utils.output_validation import get_missing_keys



def task_decomposer(state:GraphState) -> GraphState:
    print("\n[Task Breakdown Agent Started]\n")
    refined_intent = state["idea"]["refined_intent"]
    architecture_specifications = state["architecture"]
    project_structure = state["projectStructure"]
    task_decomposition_agent_prompt = PromptTemplate(
    input_variables=[
        "architecture_specification",
        "project_structure",
        "constraints",
        "human_feedback",
        "existing_tasks"
        "output_schema"
    ],
    template="""
        You are a Task Decomposition Agent inside an autonomous AI software engineering orchestration system.

        Your responsibility is to break the approved architecture and project structure into structured implementation tasks for downstream coding agents.

        You DO NOT:
        - generate implementation code
        - generate test code
        - redesign architecture
        - modify project structure
        - make new technology decisions

        You ONLY create implementation tasks and execution planning.

        -----------------------------------
        INPUTS
        -----------------------------------

        ARCHITECTURE SPECIFICATION:
        {architecture_specification}

        PROJECT STRUCTURE:
        {project_structure}

        CONSTRAINTS:
        {constraints}

        HUMAN FEEDBACK:
        {human_feedback}

        EXISTING TASKS:
        {existing_tasks}

        -----------------------------------
        YOUR OBJECTIVES
        -----------------------------------

        1. Break the system into implementation tasks.
        2. Create logically isolated coding tasks.
        3. Define dependencies between tasks.
        4. Ensure tasks align with the approved structure.
        5. Ensure tasks are sequentially executable.
        6. Keep tasks modular and manageable.
        7. Avoid overlapping responsibilities.
        8. Ensure downstream coding agents can execute tasks independently.
        9. Identify prerequisite tasks when necessary.
        10. Maintain implementation consistency.

        -----------------------------------
        IMPORTANT RULES
        -----------------------------------

        - Return ONLY valid JSON.
        - No markdown.
        - No explanations outside JSON.
        - No conversational text.
        - No code fences.
        - Do not generate code.
        - Do not redesign architecture.
        - Do not modify project structure.
        - Respect all locked architectural constraints.
        - Preserve valid existing tasks during revisions.
        - Keep tasks implementation-oriented and actionable.

        -----------------------------------
        OUTPUT JSON SCHEMA
        -----------------------------------

        {output_schema}

        -----------------------------------
        BEHAVIORAL EXPECTATIONS
        -----------------------------------

        - Think like a senior engineering manager planning implementation work.
        - Optimize for clarity, modularity, and execution flow.
        - Ensure tasks are easy for coding agents to execute.
        - Avoid vague or oversized tasks.
        - Prefer deterministic and structured planning.

        Now generate the implementation task plan.
        """
        )
    
    parser = JsonOutputParser()

    chain = task_decomposition_agent_prompt | reasoning_model | parser


    try:
        response = chain.invoke(
            {
                "architecture_specification":architecture_specifications,
                "project_structure":project_structure,
                "constraints": " ",
                "human_feedback": " ",
                "existing_tasks": " ",
                "output_schema": task_decompose_schema,
            }
        )
        template_dict = json.loads(task_decompose_schema)
        missing = get_missing_keys(template_dict, response)

        state["tasks"] = response
    except Exception as e:
        print(f"Task decomposition failed with error: {e}")
    
    print("[Task Breakdown Agent Started]\n")
    return state

