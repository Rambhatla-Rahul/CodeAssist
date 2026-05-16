import json

from models.models import reasoning_model
from graph.state import GraphState,get_initial_state
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils.output_schemas import architecture_schema
from utils.output_validation import get_missing_keys



def architecture_agent(state:GraphState) -> GraphState:
    print("\n[Architecture Agent Started]\n")

    refined_intent = state["idea"]["refined_intent"]
    functional_requirements = state["requirements"]["functional"]
    non_functional_requirements = state["requirements"]["non_functional"]
    research_manifest = state["research_manifest"]
    architecture_agent_prompt = PromptTemplate(
            input_variables=[
                "refined_intent",
                "functional_requirements",
                "non_functional_requirements",
                "constraints",
                "research_findings",
                "human_feedback",
                "existing_architecture"
                "architecture_schema"
            ],
            template="""
        You are an Architecture Agent inside an autonomous AI software engineering orchestration system.

        Your responsibility is to design a scalable, production-oriented software architecture based on the refined product intent and research findings.

        You DO NOT:
        - generate code
        - generate tests
        - create folder/file structures
        - generate deployment configurations
        - generate CI/CD pipelines

        You ONLY create technical architecture decisions and system design specifications.

        -----------------------------------
        INPUTS
        -----------------------------------

        REFINED INTENT:
        {refined_intent}

        FUNCTIONAL REQUIREMENTS:
        {functional_requirements}

        NON-FUNCTIONAL REQUIREMENTS:
        {non_functional_requirements}

        CONSTRAINTS:
        {constraints}

        RESEARCH FINDINGS:
        {research_findings}



        EXISTING ARCHITECTURE:
        {existing_architecture}

        -----------------------------------
        YOUR OBJECTIVES
        -----------------------------------

        1. Select the most suitable high-level architecture.
        2. Define frontend, backend, and database technologies.
        3. Define major system components.
        4. Define service boundaries if needed.
        5. Define API communication patterns.
        6. Define authentication and authorization strategy if required.
        7. Define state management strategy if applicable.
        8. Define data flow between components.
        9. Define scalability considerations.
        10. Define security considerations.
        11. Ensure all decisions align with constraints and requirements.
        12. Optimize for maintainability and implementation clarity.

        -----------------------------------
        IMPORTANT RULES
        -----------------------------------

        - Return ONLY valid JSON.
        - No markdown.
        - No explanations outside JSON.
        - No conversational text.
        - No code fences.
        - Keep architecture practical and implementation-oriented.
        - Avoid unnecessary complexity.
        - Do not overengineer.
        - Prefer commonly adopted production-ready solutions.
        - Ensure architectural consistency across all decisions.
        - Respect all locked constraints.
        - If revising architecture from feedback, preserve unchanged valid sections.

        -----------------------------------
        OUTPUT JSON SCHEMA
        -----------------------------------

        {architecture_schema}

        -----------------------------------
        BEHAVIORAL EXPECTATIONS
        -----------------------------------

        - Think like a senior staff-level software architect.
        - Make clear and defensible technical decisions.
        - Optimize for clarity, scalability, maintainability, and implementation feasibility.
        - Avoid speculative or experimental technologies unless justified.
        - Keep outputs structured and actionable.
        - Ensure downstream agents can directly use this architecture.

        Now generate the architecture specification.
        """
        )
    """
                "refined_intent",
                "functional_requirements",
                "non_functional_requirements",
                "constraints",
                "research_findings",
                "human_feedback",
                "existing_architecture"
                "architecture_schema"
    """
    parser = JsonOutputParser()

    chain = architecture_agent_prompt | reasoning_model | parser


    try:
        architecture_manifest = chain.invoke({
            "refined_intent": refined_intent,
            "functional_requirements": functional_requirements,
            "non_functional_requirements": non_functional_requirements,
            "constraints": " ",
            "research_findings": research_manifest,
            "human_feedback": " ",
            "existing_architecture": " ",
            "architecture_schema":architecture_schema,
        })

        template_dict = json.loads(architecture_schema)
        missing = get_missing_keys(template_dict, architecture_manifest)
        
        state["architecture"] = architecture_manifest
    except Exception as e:
        print(f"Error during intent parsing: {e}")
    
    print("[Architecture Agent Started]\n")
    return state
