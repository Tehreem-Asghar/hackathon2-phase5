import os
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel
from agents.run import RunConfig
import nest_asyncio
from .tools import add_task, list_tasks, complete_task, delete_task, update_task
from dotenv import load_dotenv

load_dotenv()
# Apply nest_asyncio
nest_asyncio.apply()

# Setup Gemini Client
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    # Fallback to OPENAI_API_KEY if GEMINI_API_KEY not set, or raise error
    gemini_api_key = os.getenv("OPENAI_API_KEY")
    
if not gemini_api_key:
    # Just a warning during import, will fail at runtime if used
    print("WARNING: GEMINI_API_KEY/OPENAI_API_KEY not found.")

external_client = AsyncOpenAI(
    api_key=gemini_api_key or "dummy", # Prevent init failure if key missing during build
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Allow model configuration
model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

model = OpenAIChatCompletionsModel(
    model=model_name,
    openai_client=external_client
)

# Global config to be used by Runner
run_config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True
)

def get_todo_agent(user_id: str) -> Agent:
    """
    Returns a configured AI agent for the specific user.
    """
    
    instructions = f"""
    You are a helpful Todo AI Assistant. Your job is to help the user manage their tasks.
    The current user's ID is: {user_id}.
    Always use this user_id when calling tools.
    
    You can:
    - Add new tasks (add_task): Extract 'title' and optional 'description' from the user's request. If the user provides details like "buy milk and get 2 gallons", use "Buy milk" as title and "Get 2 gallons" as description.
    - List tasks (list_tasks) - you can filter by pending, completed, or all.
    - Mark tasks as complete (complete_task)
    - Delete tasks (delete_task)
    - Update tasks (update_task)
    
    IMPORTANT: If the user refers to a task by name (e.g., "delete the milk task", "mark report as done"), YOU MUST FIRST call `list_tasks` to find the task ID. Do NOT ask the user for the ID. Find it yourself, then call the appropriate tool with the ID.
    
    When a user says "finish it" or "it's done" and they just listed tasks, look at the conversation history to find the task they are referring to.
    Always confirm actions to the user in a friendly way.
    If a task is not found even after listing, inform the user gracefully.
    """
    
    return Agent(
        name="Todo Assistant",
        instructions=instructions,
        tools=[add_task, list_tasks, complete_task, delete_task, update_task],
        model=model # Attach the Gemini model
    )

def get_agent_config() -> RunConfig:
    return run_config