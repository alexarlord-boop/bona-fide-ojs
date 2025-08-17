### Bona Fide Plugin and Backend

The **Bona Fide Plugin** is an OJS extension designed to enhance the workflow by integrating trust scoring functionality for authors and reviewers. It provides a user interface to display trust scores directly within the OJS backend, enabling editors to make informed decisions during the review process.

The **backend** is a FastAPI-based service that supports the plugin by handling the following key functionalities:
- **Bulk Verification**: Processes author and reviewer data to calculate trust scores.
- **PDF Export**: Generates trust score reports in PDF format for easy sharing and record-keeping.
- **Integration**: Communicates with the plugin via RESTful APIs to dynamically update trust scores.

Both components are containerized using Docker and integrated into the OJS system through Docker Compose for seamless deployment and scalability.

### Installation Instructions
1. - .
1. - .
1. - .



### Plugin artefact generation

```bash
tar -czvf bona-fide.tar.gz artefacts/
```

### Plugin upload to OJS website
- Brand new:
- Upgrade: change version.xml with new metadata --> generate new file --> "Upgrade" via option of the plugin.