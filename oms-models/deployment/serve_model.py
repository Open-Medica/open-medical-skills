#!/usr/bin/env python3
"""Simple FastAPI model server for embedding inference.

Loads a trained sentence-transformer model and serves embeddings via
HTTP API. Supports both query and document embedding with appropriate
prompting.

Usage:
    python serve_model.py --model-path ../models/oms-toolrag-gemma-v1/final
    python serve_model.py --model-path ../models/oms-toolrag-gemma-v1/final --port 8100 --device cuda
"""

import argparse
import logging
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def create_app(model_path: str, device: str = "auto") -> Any:
    """Create the FastAPI application with the loaded model.

    Args:
        model_path: Path to the sentence-transformer model.
        device: Device for inference ('auto', 'cuda', 'cpu').

    Returns:
        FastAPI application instance.
    """
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field

    # Determine device
    if device == "auto":
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"

    # Load model at startup
    from sentence_transformers import SentenceTransformer

    logger.info("Loading model from %s on device %s...", model_path, device)
    model = SentenceTransformer(model_path, device=device, trust_remote_code=True)
    embedding_dim = model.get_sentence_embedding_dimension()
    logger.info("Model loaded. Embedding dimension: %d", embedding_dim)

    # Track stats
    stats = {
        "total_requests": 0,
        "total_texts_embedded": 0,
        "total_time_seconds": 0.0,
        "model_path": model_path,
        "device": device,
        "embedding_dim": embedding_dim,
    }

    # --- Pydantic models ---

    class EmbedRequest(BaseModel):
        texts: list[str] = Field(..., description="List of texts to embed", min_length=1, max_length=256)
        type: str = Field(
            default="query",
            description="Embedding type: 'query' for search queries, 'document' for tool descriptions",
        )
        normalize: bool = Field(default=True, description="L2-normalize embeddings")

    class EmbedResponse(BaseModel):
        embeddings: list[list[float]]
        dimensions: int
        count: int
        latency_ms: float

    class HealthResponse(BaseModel):
        status: str
        model: str
        device: str
        dimensions: int
        total_requests: int
        total_texts_embedded: int

    # --- FastAPI app ---

    app = FastAPI(
        title="OMS ToolRAG Embedding Server",
        description="Serves embeddings from a fine-tuned sentence-transformer model for medical tool retrieval.",
        version="1.0.0",
    )

    @app.get("/health", response_model=HealthResponse)
    async def health_check() -> HealthResponse:
        """Health check endpoint."""
        return HealthResponse(
            status="healthy",
            model=model_path,
            device=device,
            dimensions=embedding_dim,
            total_requests=stats["total_requests"],
            total_texts_embedded=stats["total_texts_embedded"],
        )

    @app.post("/embed", response_model=EmbedResponse)
    async def embed_texts(request: EmbedRequest) -> EmbedResponse:
        """Generate embeddings for a list of texts.

        Supports two types:
        - 'query': For search queries (shorter, user-facing text)
        - 'document': For tool/skill descriptions (longer, content text)
        """
        if not request.texts:
            raise HTTPException(status_code=400, detail="No texts provided")

        if len(request.texts) > 256:
            raise HTTPException(status_code=400, detail="Maximum 256 texts per request")

        t0 = time.time()

        try:
            embeddings = model.encode(
                request.texts,
                normalize_embeddings=request.normalize,
                convert_to_numpy=True,
                show_progress_bar=False,
            )
        except Exception as exc:
            logger.error("Embedding error: %s", exc)
            raise HTTPException(status_code=500, detail=f"Embedding failed: {exc}")

        latency_ms = (time.time() - t0) * 1000

        # Update stats
        stats["total_requests"] += 1
        stats["total_texts_embedded"] += len(request.texts)
        stats["total_time_seconds"] += latency_ms / 1000

        return EmbedResponse(
            embeddings=embeddings.tolist(),
            dimensions=embedding_dim,
            count=len(request.texts),
            latency_ms=round(latency_ms, 2),
        )

    @app.get("/stats")
    async def get_stats() -> dict[str, Any]:
        """Get server statistics."""
        avg_latency = (
            (stats["total_time_seconds"] / stats["total_requests"] * 1000)
            if stats["total_requests"] > 0
            else 0.0
        )
        return {
            **stats,
            "avg_latency_ms": round(avg_latency, 2),
        }

    return app


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Serve OMS ToolRAG embedding model via FastAPI"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        required=True,
        help="Path to trained sentence-transformer model",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8100,
        help="Server port (default: 8100)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Server host (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--device",
        choices=["auto", "cuda", "cpu"],
        default="auto",
        help="Inference device (default: auto-detect)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of uvicorn workers (default: 1)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Validate model path
    model_path = Path(args.model_path)
    if model_path.exists():
        logger.info("Model path: %s", model_path.resolve())
    else:
        logger.info("Model path not found locally, will try as HF model name: %s", args.model_path)

    app = create_app(str(args.model_path), device=args.device)

    import uvicorn

    logger.info("Starting server on %s:%d", args.host, args.port)
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        workers=args.workers,
        log_level=args.log_level.lower(),
    )


if __name__ == "__main__":
    main()
