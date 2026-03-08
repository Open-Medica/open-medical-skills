"""Configuration for openemr-mcp. All settings via environment variables."""

import os
from pathlib import Path

from dotenv import dotenv_values
from pydantic import BaseModel, ConfigDict

_cwd_env = dotenv_values(Path.cwd() / ".env") if (Path.cwd() / ".env").exists() else {}
for _key, _value in _cwd_env.items():
    if _value is not None and _key not in os.environ:
        os.environ[_key] = _value


class Settings(BaseModel):
    env: str = os.getenv("ENV", "dev")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    openemr_data_source: str = os.getenv("OPENEMR_DATA_SOURCE", "mock")
    openemr_db_host: str = os.getenv("OPENEMR_DB_HOST", "localhost")
    openemr_db_port: int = int(os.getenv("OPENEMR_DB_PORT", "3306"))
    openemr_db_user: str = os.getenv("OPENEMR_DB_USER", "openemr")
    openemr_db_password: str = os.getenv("OPENEMR_DB_PASSWORD", "")
    openemr_db_name: str = os.getenv("OPENEMR_DB_NAME", "openemr")
    openemr_api_base_url: str | None = os.getenv("OPENEMR_API_BASE_URL")
    openemr_oauth_site: str = os.getenv("OPENEMR_OAUTH_SITE", "default")
    openemr_oauth_client_id: str | None = os.getenv("OPENEMR_OAUTH_CLIENT_ID")
    openemr_oauth_client_secret: str | None = os.getenv("OPENEMR_OAUTH_CLIENT_SECRET")
    openemr_oauth_username: str | None = os.getenv("OPENEMR_OAUTH_USERNAME")
    openemr_oauth_password: str | None = os.getenv("OPENEMR_OAUTH_PASSWORD")
    openemr_api_verify_ssl: bool = os.getenv("OPENEMR_API_VERIFY_SSL", "true").lower() == "true"
    openemr_enable_client_via_sql: bool = os.getenv("OPENEMR_ENABLE_CLIENT_VIA_SQL", "false").lower() == "true"
    openemr_docker_service: str | None = os.getenv("OPENEMR_DOCKER_SERVICE")
    openemr_docker_cwd: str | None = os.getenv("OPENEMR_DOCKER_CWD")
    drug_interaction_source: str = os.getenv("DRUG_INTERACTION_SOURCE", "mock")
    symptom_source: str = os.getenv("SYMPTOM_SOURCE", "mock")
    infermedica_app_id: str | None = os.getenv("INFERMEDICA_APP_ID")
    infermedica_app_key: str | None = os.getenv("INFERMEDICA_APP_KEY")
    openfda_source: str = os.getenv("OPENFDA_SOURCE", "mock")
    openfda_api_key: str | None = os.getenv("OPENFDA_API_KEY")

    model_config = ConfigDict(extra="ignore")


settings = Settings()
