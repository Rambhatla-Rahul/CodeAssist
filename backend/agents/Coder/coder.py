import json
import os

from models.models import coding_model
from graph.state import GraphState
from utils.output_schemas import code_file_schema
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser



def coder_agent(state:GraphState,current_task) -> GraphState:
    print(f"[Coder Agent Started Generating] ==> {current_task['task_id']}\n")
    architecture_specification = state['architecture']
    project_structure = state['projectStructure']


    coder_agent_prompt = PromptTemplate(
    input_variables=[
        "current_task",
        "architecture_specification",
        "project_structure",
        "relevant_existing_code",
        "constraints",
        "human_feedback",
        "output_schema"
    ],
    template="""
        You are a Coder Agent inside an autonomous AI software engineering orchestration system.

        Your responsibility is to generate production-quality implementation code for the assigned task.

        You ONLY generate code for the current task and its target files.

        You DO NOT:
        - redesign architecture
        - modify project structure
        - generate unrelated files
        - generate deployment configurations
        - generate CI/CD pipelines
        - generate unnecessary boilerplate
        - change locked constraints

        -----------------------------------
        INPUTS
        -----------------------------------

        CURRENT TASK:
        {current_task}

        ARCHITECTURE SPECIFICATION:
        {architecture_specification}

        PROJECT STRUCTURE:
        {project_structure}

        RELEVANT EXISTING CODE:
        {relevant_existing_code}

        CONSTRAINTS:
        {constraints}

        HUMAN FEEDBACK:
        {human_feedback}

        -----------------------------------
        YOUR OBJECTIVES
        -----------------------------------

        1. Generate complete implementation code for the assigned task.
        2. Only generate files listed in target_files.
        3. Ensure compatibility with the approved architecture.
        4. Ensure consistency with existing code.
        5. Generate clean, maintainable, modular code.
        6. Follow production-grade coding practices.
        7. Respect dependency relationships.
        8. Avoid placeholder implementations unless explicitly necessary.
        9. Ensure imports and module references remain consistent.
        10. Keep implementations scoped strictly to the assigned task.

        -----------------------------------
        IMPORTANT RULES
        -----------------------------------

        - Return ONLY valid JSON.
        - No markdown.
        - No explanations outside JSON.
        - No conversational text.
        - No code fences.
        - Do not generate files outside target_files.
        - Do not modify architecture decisions.
        - Do not generate pseudo-code.
        - Do not leave TODO placeholders unless unavoidable.
        - Preserve consistency with existing modules and naming conventions.
        - Respect all locked constraints.
        - Generate complete runnable file contents whenever possible.

        -----------------------------------
        OUTPUT JSON SCHEMA
        -----------------------------------

        {output_schema}

        -----------------------------------
        BEHAVIORAL EXPECTATIONS
        -----------------------------------

        - Think like a senior software engineer implementing production code.
        - Prioritize correctness, maintainability, and architectural consistency.
        - Keep implementations modular and readable.
        - Avoid unnecessary abstractions.
        - Avoid overengineering.
        - Generate deterministic and implementation-ready outputs.

        Now generate the implementation code for the assigned task.
        """
    )
    parser = JsonOutputParser()

    chain = coder_agent_prompt | coding_model | parser

    try:
        response = chain.invoke({
            "current_task":current_task,
            "architecture_specification":architecture_specification,
            "project_structure": project_structure,
            "relevant_existing_code": " ",
            "constraints": " ",
            "human_feedback": " ",
            "output_schema": code_file_schema
        })

        template_dict = json.loads(code_file_schema)
        state["code_file"] = response

        save_generated_files_to_base_dir(response,state["project_details"]["path"])

    except Exception as e:
        print(f"Error generating Code File : {e}")
    print(f"[Coder Agent Completed Generating] ==> {current_task['task_id']}\n")
    return state


def save_generated_files_to_base_dir(output_data: dict, base_folder: str) -> None:
    for file_info in output_data.get("generated_files", []):
        file_path = file_info.get("file_path", "")
        content = file_info.get("content", "")
        
        if not file_path:
            continue
            
        full_path = os.path.join(base_folder, file_path.lstrip("\\/"))
        directory = os.path.dirname(full_path)
        
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)