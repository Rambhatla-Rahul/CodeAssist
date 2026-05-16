import json
import os

from models.models import reasoning_model
from graph.state import GraphState,get_initial_state
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils.output_schemas import refined_intent_schema
from utils.output_validation import get_missing_keys


def intent_parser(raw_intent:str,state:GraphState, existing_constraints: any = " ",conversation_context: any =  " ") -> GraphState:
    """
    Takes raw input prompt from a user which can be simple english prompt and defines what the user wants or the end goal of the application.
    The agent generates and validates the output based on the output schema in order for the next agent to start its work.
    """
    print("[Intent Agent Started]\n")
    state["idea"]["raw_intent"] = raw_intent
    parser = JsonOutputParser()

    intent_refinement_prompt = PromptTemplate(
    input_variables=[
        "raw_user_intent",
        "conversation_context",
        "existing_constraints"
        "output_schema"
    ],


    template="""
        You are an Intent Refinement Agent inside an autonomous AI software engineering orchestration system.

        Your responsibility is to transform vague startup ideas into structured, implementation-oriented product intent.

        You DO NOT:
        - design architecture
        - select frameworks
        - generate code
        - create database schemas
        - make infrastructure decisions

        Your ONLY responsibility is refining and clarifying product intent.

        -----------------------------------
        INPUTS
        -----------------------------------

        RAW USER INTENT:
        {raw_user_intent}

        CONVERSATION CONTEXT:
        {conversation_context}

        EXISTING CONSTRAINTS:
        {existing_constraints}

        -----------------------------------
        YOUR OBJECTIVES
        -----------------------------------

        1. Extract the actual product goal.
        2. Infer the primary user problem being solved.
        3. Identify the target users.
        4. Extract functional requirements explicitly mentioned.
        5. Infer missing but necessary functional requirements.
        6. Identify non-functional expectations if implied.
        7. Remove ambiguity wherever possible.
        8. Rewrite the idea into structured implementation-ready intent.
        9. Preserve the original meaning and business goal.
        10. DO NOT hallucinate unnecessary features.

        -----------------------------------
        OUTPUT RULES
        -----------------------------------

        - Return ONLY valid JSON.
        - No markdown.
        - No explanations.
        - No conversational text.
        - No code fences.
        - Keep outputs concise but complete.
        - If information is missing, mark it under "assumptions".
        - Do not invent technical stack decisions.

        -----------------------------------
        OUTPUT JSON SCHEMA
        -----------------------------------

        {output_schema}

        -----------------------------------
        IMPORTANT BEHAVIORAL RULES
        -----------------------------------

        - Think like a senior product strategist.
        - Optimize for clarity and implementation readiness.
        - Keep business intent intact.
        - Do not perform technical architecture reasoning.
        - Do not discuss APIs, frameworks, deployment, or databases.
        - Avoid generic filler statements.
        - Avoid buzzwords unless directly relevant.

        Now refine the user intent.
        """
        )

    parser = JsonOutputParser()
    
    chain = intent_refinement_prompt | reasoning_model | parser
    try:
        refined_intent = chain.invoke({
            "raw_user_intent": raw_intent,
            "conversation_context": conversation_context,
            "existing_constraints": existing_constraints,
            "output_schema": refined_intent_schema
        })

        template_dict = json.loads(refined_intent_schema)
        missing = get_missing_keys(template_dict, refined_intent)
        if missing:
            correction_prompt = f"""
            The previous JSON output was missing the following keys required by the schema:
            {missing}
            
            Please regenerate the full JSON, ensuring every key listed above is included.
            Maintain all other data you already generated.
            
            ORIGINAL INTENT: {raw_intent}
            FULL SCHEMA: {refined_intent_schema}
            """
            refined_intent = reasoning_model.invoke(correction_prompt)
            refined_intent = parser.parse(refined_intent.content)
        
        state["idea"]["refined_intent"] = refined_intent
        functional_requirements = refined_intent["functional_requirements"]
        non_functional_requirements = refined_intent["non_functional_requirements"]

        state["requirements"]["functional"] = functional_requirements
        state["requirements"]["non_functional"] = non_functional_requirements

    except Exception as e:
        print(f"Error during intent parsing: {e}")

    
    print("[Intent Agent Completed]\n")
    return state


def project_namer(state: GraphState) -> GraphState:
    print("\n[Name Generator Started]\n")
    raw_user_input = state["idea"]["raw_intent"]
    product_naming_agent_prompt = PromptTemplate(
        input_variables=[
            "raw_user_input"
        ],
        template="""
    You are a Product Naming Agent inside an autonomous AI software engineering orchestration system.

    Your ONLY responsibility is to generate a concise and relevant product name based on the user's startup idea.

    -----------------------------------
    INPUT
    -----------------------------------

    RAW USER INPUT:
    {raw_user_input}

    -----------------------------------
    RULES
    -----------------------------------

    - Return ONLY valid JSON.
    - No markdown.
    - No explanations.
    - No conversational text.
    - No code fences.
    - Generate only ONE product name.
    - Keep the name short, memorable, and relevant.
    - Avoid generic names.
    - Absolutely Avoid special characters except underscore.
    - Do not generate taglines or descriptions.

    -----------------------------------
    OUTPUT JSON SCHEMA
    -----------------------------------

    {{
    "product_name": ""
    }}

    Now generate the product name.
    """
    )
    parser = JsonOutputParser()
    chain = product_naming_agent_prompt | reasoning_model | parser

    try:
        name = chain.invoke({
            "raw_user_input": raw_user_input,
        })
        state["project_details"]["name"] = name["product_name"]
        state["project_details"]["path"] = create_folder_if_not_exists(r"C:\Users\RAHUL\OneDrive\Desktop\AIML\Projects\CodeAssist\backend\GeneratedProjects",name["product_name"])
    except Exception as e:
        print(f"Error generating Name: {e}")
    
    print("\n[Name Generator Completed]\n")
    return state

def create_folder_if_not_exists(path: str, folder_name: str) -> str:
    full_path = os.path.join(path, folder_name)
    if not os.path.exists(full_path):
        os.makedirs(full_path, exist_ok=True)
    return full_path

if __name__ == "__main__":
    initial_state = get_initial_state()
    
    user_intent = "I would like to build a real-time video and audio streaming application which allows users to video call screen share and send files to each other."
    updated_state = intent_parser(raw_intent=user_intent,state=initial_state)