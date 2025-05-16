# Backend Component

This backend component is a FastAPI-based service designed to handle user verification and generate trust score reports. It provides the following key functionalities:

1. **Bulk Verification**: Processes bulk user data (authors or reviewers) and assigns trust scores.
2. **PDF Export**: Generates and exports trust score reports in PDF format.
3. **Payload Verification**: Handles and logs verification payloads for debugging or auditing purposes.

The service is containerized using Docker and integrated into the overall system via Docker Compose. It communicates with other components through a shared network.

```yaml
services:
  db: ...

  ojs: ...

  fastapi:
    build:
      context: ./backend
    container_name: fastapi
    ports:
      - "8000:8000"
    networks:
      - inside
```

If you want to spin up OJS with this bakcend as a sidecar, make sure that /backend directory lies on the same level as the ```docker-compose.yml``` file.