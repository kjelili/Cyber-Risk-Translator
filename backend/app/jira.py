from typing import Dict, Any

def create_jira_issue_stub(ticket: Dict[str, Any]) -> Dict[str, Any]:
    """
    MVP stub. Replace with real Jira integration later:
    - OAuth/API token
    - projectKey mapping
    - issue type mapping
    """
    return {
        "created": True,
        "jira_key": "RT-123",
        "url": "https://jira.example/browse/RT-123",
        "ticket": ticket
    }
