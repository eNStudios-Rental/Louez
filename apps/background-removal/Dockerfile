FROM python:3.12-slim AS app

ARG REMBG_VERSION=2.0.75
ARG REMBG_MODEL=isnet-general-use

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    U2NET_HOME=/models \
    REMBG_MODEL=${REMBG_MODEL}

RUN groupadd --system --gid 1001 rembg \
    && useradd --system --uid 1001 --gid rembg --home-dir /app rembg \
    && mkdir -p /app /models \
    && chown -R rembg:rembg /app /models \
    && pip install --timeout 180 --retries 10 \
      "rembg[cpu]==${REMBG_VERSION}" \
      "fastapi==0.128.0" \
      "python-multipart==0.0.21" \
      "uvicorn==0.40.0"

USER rembg
WORKDIR /app

# Bake the model into the image so production never downloads weights on the
# first merchant request.
RUN python -c 'import os; from rembg import new_session; new_session(os.environ["REMBG_MODEL"])'

COPY --chown=rembg:rembg apps/background-removal/main.py /app/main.py

EXPOSE 7000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7000/health', timeout=4)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7000"]
