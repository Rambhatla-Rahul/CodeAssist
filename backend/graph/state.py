from typing import Dict, List, Optional, TypedDict

class ProjectDetails(TypedDict):
    name: str
    description: str
    domain: str
    path: str

class Idea(TypedDict):
    raw_intent: str
    refined_intent: str

class Architecture(TypedDict):
    overview: Optional[Dict | str]
    frontend: Optional[Dict]
    backend: Optional[Dict]
    database: Optional[Dict]
    core_components: Optional[Dict]
    data_flow: List[Optional[Dict | str]]
    security_design : Optional[Dict]
    scalability_design: Optional[Dict]
    technical_constraints: List[Optional[Dict]]
    architecture_risks : List[Optional[Dict]]
    patterns: List[Optional[Dict]]
    architecture_summary: Optional[str]

class Requirements(TypedDict):
    functional: List[str | Dict]
    non_functional: List[str | Dict]

class ProjectStructure(TypedDict):
    directories : List[Optional[Dict]]
    files: List[Optional[Dict]]

class Task:
    task_id: Optional[str]
    task_name: Optional[str]
    description: Optional[str]
    target_files: List[Optional[str | dict]]
    dependencies: List[Optional[str | dict]]
    priority : str
    assigned_agent_type: str

class TaskGroups:
    group_name: Optional[str]
    tasks: List[Optional[Task]]

class TaskImplementation:
    implementation_tasks : List[Optional[Task]]
    execution_order : List[Optional[str | dict]]
    task_groups : List[Optional[TaskGroups]]
    dependency_notes : List[Optional[str | dict]]
    task_summary: str

class GeneratedFile(TypedDict):
    file_name: str
    file_path: str
    purpose: str
    content:str
class CodeFiles(TypedDict):
    generated_files : List[Optional[GeneratedFile]]
    dependencies_used: List[Optional[str | dict]]
    important_notes : List[Optional[str | dict]]
    generation_summary: Optional[str]

class TestFile(TypedDict):
    path: str
    file_name: str
    content:str
    summary: str

class Feedbacks(TypedDict):
    approver: str
    choice: Optional[Dict]
    feedback: Optional[Dict]

class DirectoryGroup(TypedDict):
    directories: List[str]
    files: List[str]

class ModuleResponsibility(TypedDict):
    module: str
    responsibility: str

class FullProjectStructure(TypedDict):
    frontend: DirectoryGroup
    backend: DirectoryGroup
    database: DirectoryGroup
    shared: DirectoryGroup

class ProjectStructureOutput(TypedDict):
    project_structure: FullProjectStructure
    module_responsibilities: List[ModuleResponsibility]
    file_generation_order: List[str]
    dependency_notes: List[str]
    structure_summary: str


class GraphState(TypedDict):
    idea : Optional[Idea]
    research_manifest : Optional[Dict]
    project_details : Optional[ProjectDetails]    
    architecture: Optional[Architecture]
    requirements: Optional[Requirements]
    projectStructure: Optional[ProjectStructureOutput]
    tasks: Optional[TaskImplementation]
    code_file: Optional[CodeFiles]
    test_file: Optional[List[TestFile]]
    feedbacks: Optional[List[Feedbacks]]



def get_initial_state() -> GraphState:
    return {
        "idea": {"raw_intent": "", "refined_intent": ""},
        "research_manifest": {},
        "project_details": {"name": "", "description": "", "domain": "","path":""},
        "architecture": {
            "overview": "",
            "frontend": None, 
            "backend": None, 
            "database": None, 
            "patterns": [], 
            "security_design": None,
            "core_components": None,
            "architecture_risks": [],
            "data_flow": [],
            "technical_constraints": [],
            "scalability_design": None,
            "architecture_summary": ""
        },
        "requirements": {"functional": [], "non_functional": []},
        
        "projectStructure": {
            "project_structure": {
                "frontend": {"directories": [], "files": []},
                "backend": {"directories": [], "files": []},
                "database": {"directories": [], "files": []},
                "shared": {"directories": [], "files": []},
            },
            "module_responsibilities": [],
            "file_generation_order": [],
            "dependency_notes": [],
            "structure_summary": ""
        },
        "tasks": {
            "implementation_tasks": [
                {
                    "task_id": None,
                    "task_name": None,
                    "description": None,
                    "target_files": [],
                    "dependencies": [],
                    "priority": "medium",
                    "assigned_agent_type": ""
                }
            ],
            "execution_order": [],
            "task_groups": [
                {
                    "group_name": None,
                    "tasks": []
                }
            ],
            "dependency_notes": [],
            "task_summary": ""
        },
        "code_file": {
            "generated_files": [
                {
                "file_name": "",
                "file_path": "",
                "purpose": "",
                "content": ""
                }
            ],

            "dependencies_used": [],

            "important_notes": [],

            "generation_summary": ""
        },
        "test_file": [],
        "feedbacks": []
    }