# Python 3.11 Environment & Dependency Rules

This workspace relies on an established, isolated Python 3.11 environment. The production application must remain unaffected by development pipelines (like YOLO11).

When handling packages, dependencies, or environment changes, you MUST strictly adhere to the following constraints:

## Restrictions
- **DO NOT** upgrade or downgrade Python.
- **DO NOT** automatically upgrade existing packages.
- **DO NOT** install conflicting package versions.
- **DO NOT** replace the existing environment.
- **DO NOT** create a second Python environment unless explicitly requested by the user.
- **DO NOT** change TensorFlow or Keras versions used by the existing project.
- **DO NOT** change NumPy or OpenCV versions without first checking compatibility.

## Package Installation Protocol
Before installing ANY new package, you MUST follow this sequence:
1. Inspect the current Python version (ensure it is 3.11).
2. Inspect currently installed relevant packages and their exact versions.
3. Determine whether the requested package is already installed.
4. If installation is required, select a version that is known to be compatible with Python 3.11 and the existing installed packages.
5. **CRITICAL**: Before executing the installation command or modifying requirements files, you MUST stop and tell the user exactly what package and version will be installed, and wait for explicit approval.
