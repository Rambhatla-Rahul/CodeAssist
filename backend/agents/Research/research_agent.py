import json

from models.models import reasoning_model
from graph.state import GraphState,get_initial_state
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils.output_schemas import research_schema
from utils.output_validation import get_missing_keys




def research_agent(state:GraphState,constraints:str = " ", project_context:str = " ") -> GraphState:
    print("[Research Agent Started]")
    refined_intent = state["idea"]["refined_intent"]
    functional_requirements = state["requirements"]["functional"]
    non_functional_requirements = state["requirements"]["non_functional"]
    research_agent_prompt = PromptTemplate(
        input_variables=[
            "refined_intent",
            "functional_requirements",
            "non_functional_requirements",
            "constraints",
            "project_context",
            "output_schema"
        ],
        template="""
            You are a Research Agent inside an autonomous AI software engineering orchestration system.

            Your responsibility is to perform focused technical and product research that helps downstream agents make better architectural and implementation decisions.

            You DO NOT:
            - generate code
            - design complete architecture
            - create project structures
            - generate APIs
            - make final technical decisions

            You ONLY gather relevant implementation knowledge, patterns, risks, and recommendations.

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

            PROJECT CONTEXT:
            {project_context}

            -----------------------------------
            YOUR OBJECTIVES
            -----------------------------------

            1. Identify the most relevant software patterns for the product.
            2. Identify common architectural approaches used for similar systems.
            3. Identify scalability considerations if relevant.
            4. Identify security considerations if relevant.
            5. Identify important implementation challenges.
            6. Identify important domain-specific concerns.
            7. Identify potential risks and bottlenecks.
            8. Identify recommended best practices.
            9. Identify optional enhancements for future scalability.
            10. Provide research insights ONLY — not final decisions.

            -----------------------------------
            IMPORTANT RULES
            -----------------------------------

            - Return ONLY valid JSON.
            - No markdown.
            - No explanations outside JSON.
            - No conversational language.
            - No code fences.
            - Keep insights practical and implementation-oriented.
            - Do not hallucinate technologies unrelated to the product.
            - Do not choose a final stack.
            - Do not generate architecture diagrams.
            - Avoid generic advice.
            - Prefer actionable technical insights.

            -----------------------------------
            OUTPUT JSON SCHEMA
            -----------------------------------

            {output_schema}

            -----------------------------------
            BEHAVIORAL EXPECTATIONS
            -----------------------------------

            - Think like a senior software architect performing preliminary technical research.
            - Focus on high-signal insights.
            - Keep outputs structured and concise.
            - Support downstream architectural reasoning.
            - Avoid overengineering recommendations.
            - Prioritize practical engineering concerns.

            Now perform the research analysis.
        """
    )
    parser = JsonOutputParser()
    chain = research_agent_prompt | reasoning_model | parser

    try:
        research_manifest = chain.invoke(
            {
                "refined_intent": refined_intent,
                "functional_requirements": functional_requirements,
                "non_functional_requirements": non_functional_requirements,
                "constraints": constraints,
                "project_context": project_context,
                "output_schema": research_schema
            }
        )
        template_dict = json.loads(research_schema)
        missing = get_missing_keys(template_dict, research_manifest)
        state["research_manifest"] = research_manifest
    except Exception as e:
        print(f"Error during intent parsing: {e}")

    print("[Research Agent Completed]\n")
    return state