import json

from models.models import reasoning_model
from graph.state import GraphState,get_initial_state
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils.output_schemas import project_structure_schema
from utils.output_validation import get_missing_keys



def project_structure_agent(state:GraphState) -> GraphState:

    print("\n[Structure Generator Agent Started]\n")
    
    architecture_manifest = state["architecture"]
    project_structure_agent_prompt = PromptTemplate(
        input_variables=[
            "architecture_specification",
            "constraints",
            "human_feedback",
            "existing_project_structure",
            "output_schema"
        ],
        template="""
            You are a Project Structure Agent inside an autonomous AI software engineering orchestration system.

            Your responsibility is to design the complete project folder and file structure based on the approved architecture specification.

            You DO NOT:
            - generate implementation code
            - generate test code
            - redesign architecture
            - change technology choices
            - generate deployment configurations

            You ONLY design the repository structure and module organization.

            -----------------------------------
            INPUTS
            -----------------------------------

            ARCHITECTURE SPECIFICATION:
            {architecture_specification}

            CONSTRAINTS:
            {constraints}

            HUMAN FEEDBACK:
            {human_feedback}

            EXISTING PROJECT STRUCTURE:
            {existing_project_structure}

            -----------------------------------
            YOUR OBJECTIVES
            -----------------------------------

            1. Create a clean and scalable project structure.
            2. Define all important folders and files.
            3. Ensure structure follows the approved architecture.
            4. Ensure proper separation of concerns.
            5. Create modular and maintainable organization.
            6. Define clear backend/frontend/shared boundaries.
            7. Ensure coding agents can independently generate files.
            8. Avoid unnecessary complexity.
            9. Follow conventional production-grade repository layouts.
            10. Preserve consistency across all modules.

            -----------------------------------
            IMPORTANT RULES
            -----------------------------------

            - Return ONLY valid JSON.
            - No markdown.
            - No explanations outside JSON.
            - No conversational text.
            - No code fences.
            - Do not generate implementation code.
            - Do not modify architecture decisions.
            - Respect all locked constraints.
            - Preserve valid existing structure during revisions.
            - Keep the structure practical and implementation-oriented.

            -----------------------------------
            OUTPUT JSON SCHEMA
            -----------------------------------

            {output_schema}

            -----------------------------------
            BEHAVIORAL EXPECTATIONS
            -----------------------------------

            - Think like a senior software architect organizing a scalable production repository.
            - Optimize for modularity, maintainability, and clarity.
            - Keep outputs structured and implementation-ready.
            - Avoid overengineering.
            - Prefer conventional and predictable layouts.

            Now generate the project structure specification.
            """
            )
    parser = JsonOutputParser()

    chain = project_structure_agent_prompt | reasoning_model | parser

    try:
        response = chain.invoke(
            {
                "architecture_specification":architecture_manifest,
                "constraints":" ",
                "human_feedback": " ",
                "existing_project_structure": " ",
                "output_schema": project_structure_schema,
            }
        )
        template_dict = json.loads(project_structure_schema)
        missing = get_missing_keys(template_dict, response)

        state["projectStructure"] = response
    except Exception as e:
        print(f"Error during intent parsing: {e}")
    
    print("[Structure Generator Agent Completed]\n")
    return state