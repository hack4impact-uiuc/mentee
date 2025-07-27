# this dockerfile is used for product deployments
FROM python:3.9.18-slim
LABEL maintainer "Kelley Chau <kelleyc2@illinois.edu>"

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install system dependencies
RUN apt-get update -y && \
    apt-get install -y python3-dev python3-pkg-resources python3-setuptools python3-wheel python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary application files
COPY api/ /app/api/
COPY manage.py /app/
COPY firebase_service_key.json /app/
COPY scripts.py /app/

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

ENTRYPOINT [ "python" ]

CMD [ "manage.py", "runserver" ]
# CMD [ "manage.py", "runprod" ]